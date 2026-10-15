import { focusElement, getTabbableElements, isAvailable, isVisible } from "./tabbable";
import type { ModalFocusScope } from "./modal-scope";

export type ModalDismissReason = 'escape' | 'outside';
export interface ModalFocusOptions {
  open: boolean;
  initialFocus?: () => HTMLElement | null;
  returnFocus?: () => HTMLElement | null;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: MouseEvent) => void;
  onDismiss?: (reason: ModalDismissReason) => void;
}

/** Shared stack for modal dialogs and non-modal anchored layers. */
export type LayerFocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

export interface LayerFocusOptions extends ModalFocusOptions {
  modal?: boolean;
  /** Non-modal windows may be raised without closing their sibling windows. */
  activatable?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trigger?: () => HTMLElement | null;
  closeOnFocusOutside?: boolean;
  onFocusOutside?: (event: LayerFocusOutsideEvent) => void;
}

interface Layer {
  scope: ModalFocusScope;
  content: HTMLElement;
  options: () => LayerFocusOptions;
  previous: HTMLElement | null;
  lastFocused: HTMLElement | null;
  interactedOutside: boolean;
  onOrderChange?: (active: boolean, index: number) => void;
}

// Only committed browser layers live here. Empty documents are removed on the last cleanup.
const documents = new WeakMap<Document, ModalLayers>();

class ModalLayers {
  private layers: Layer[] = [];
  private active: Layer | undefined;
  private inert = new Map<HTMLElement, string | null>();
  private restoreScroll: (() => void) | undefined;
  private observer: MutationObserver;
  private redirecting = false;
  private pointer: { layer: Layer; outside: boolean } | undefined;

  constructor(private document: Document) {
    const Observer = document.defaultView!.MutationObserver;
    this.observer = new Observer(() => {
      const previous = this.top();
      this.syncInert();
      if (previous && !this.top()) this.returnFocus(previous, undefined);
      this.containFocus();
    });
  }

  private top() {
    return this.active;
  }

  private modal() {
    return [...this.layers].reverse().find((layer) => layer.options().modal !== false && isVisible(layer.content));
  }

  private descendants(layer: Layer) {
    return this.layers.filter((item) => {
      if (!isVisible(item.content)) return false;
      if (layer.content.contains(item.content)) return true;
      for (let parent = item.scope.parent; parent; parent = parent.parent) {
        if (parent === layer.scope) return true;
      }
      return false;
    });
  }

  private contains(layer: Layer, target: Node | null) {
    return !!target && this.descendants(layer).some((item) => item.content.contains(target));
  }

  private tabbables(layer: Layer) {
    return [...new Set(this.descendants(layer).flatMap((item) => getTabbableElements(item.content)))];
  }

  private focusInside(layer: Layer, initial = false) {
    const preferred = initial ? layer.options().initialFocus?.() : layer.lastFocused;
    if (preferred && layer.content.contains(preferred) && focusElement(preferred)) return;
    if (focusElement(this.tabbables(layer)[0])) return;
    focusElement(layer.content);
  }

  private containFocus = () => {
    const layer = this.modal();
    if (!layer || this.redirecting || !layer.content.isConnected) return;
    const active = this.document.activeElement as HTMLElement | null;
    if (active && this.contains(layer, active) && isAvailable(active)) {
      layer.lastFocused = active;
      return;
    }
    this.redirecting = true;
    try {
      this.focusInside(layer);
    } finally {
      this.redirecting = false;
    }
  };

  private focusin = (event: FocusEvent) => {
    if (!this.redirecting) {
      const focused = [...this.layers].reverse().find((item) => item.content.contains(event.target as Node));
      if (focused?.options().activatable) this.activate(focused.content);
    }
    const layer = this.top();
    if (layer && layer.options().modal === false) {
      const options = layer.options();
      const target = event.target as Node | null;
      if (!this.contains(layer, target) && !options.trigger?.()?.contains(target)) {
        // Native focusin is not cancelable. Cancel only dismissal, never the completed focus move.
        const outside = new this.document.defaultView!.CustomEvent('iris.focusoutside', {
          cancelable: true,
          detail: { originalEvent: event },
        });
        options.onFocusOutside?.(outside);
        if (!outside.defaultPrevented && options.closeOnFocusOutside !== false) {
          layer.interactedOutside = true;
          options.onDismiss?.('outside');
        }
      } else layer.interactedOutside = false;
    }
    this.containFocus();
  };

  private keydown = (event: KeyboardEvent) => {
    const layer = this.top();
    if (!layer || event.defaultPrevented || event.isComposing) return;
    if (event.key === 'Escape') {
      const options = layer.options();
      options.onEscapeKeyDown?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      if (options.closeOnEscape !== false) {
        layer.interactedOutside = false;
        options.onDismiss?.('escape');
      }
    } else if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
      const modal = this.modal();
      if (!modal) return;
      const items = this.tabbables(modal);
      const index = items.indexOf(this.document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? items[index <= 0 ? items.length - 1 : index - 1]
        : items[index < 0 || index === items.length - 1 ? 0 : index + 1];
      event.preventDefault();
      if (!focusElement(next)) focusElement(modal.content);
    }
  };

  private outside(layer: Layer, event: Event) {
    const path = event.composedPath();
    return (
      !this.descendants(layer).some((item) => path.includes(item.content)) &&
      !(layer.options().modal === false && path.includes(layer.options().trigger?.() as EventTarget))
    );
  }

  private pointerdown = (event: PointerEvent) => {
    const layer = this.top();
    if (!layer) return;
    const outside = this.outside(layer, event);
    this.pointer = { layer, outside };
    if (!outside) return;
    if (layer.options().modal === false) return;
    // Keep focus inside and prevent background handlers. Dismiss on click, so no click-through occurs.
    event.preventDefault();
    event.stopPropagation();
  };

  private click = (event: MouseEvent) => {
    const layer = this.top();
    const pointer = this.pointer;
    this.pointer = undefined;
    if (!layer || !this.outside(layer, event)) return;
    const cancelled = event.defaultPrevented;
    const options = layer.options();
    if (options.modal === false) {
      if (!cancelled && (!pointer || (pointer.layer === layer && pointer.outside))) {
        options.onInteractOutside?.(event);
        if (!event.defaultPrevented && options.closeOnOutside !== false) {
          layer.interactedOutside = true;
          options.onDismiss?.('outside');
        }
      }
      return;
    }
    event.stopPropagation();
    if (!cancelled && (!pointer || (pointer.layer === layer && pointer.outside))) {
      options.onInteractOutside?.(event);
      const dismiss = !event.defaultPrevented && options.closeOnOutside;
      event.preventDefault();
      if (dismiss) options.onDismiss?.('outside');
    } else event.preventDefault();
  };

  private syncInert() {
    this.active = [...this.layers].reverse().find((layer) => isVisible(layer.content));
    this.layers.forEach((layer, index) => layer.onOrderChange?.(layer === this.active, index));
    const modal = this.modal();
    const content = modal?.content;
    if (content && !this.restoreScroll) this.lockScroll();
    else if (!content && this.restoreScroll) {
      this.restoreScroll();
      this.restoreScroll = undefined;
    }
    const next = new Set<HTMLElement>();
    if (content?.isConnected) {
      const allowed = this.descendants(modal!).map((layer) => layer.content);
      // Preserve all descendant portal branches of the active modal.
      for (const leaf of allowed)
        for (let node: HTMLElement = leaf; node.parentElement; node = node.parentElement) {
          for (const sibling of node.parentElement.children) {
            if (
              sibling !== node &&
              !allowed.some((element) => sibling.contains(element) || element.contains(sibling)) &&
              sibling instanceof this.document.defaultView!.HTMLElement
            )
              next.add(sibling as HTMLElement);
          }
          if (node.parentElement === this.document.body) break;
        }
    }
    for (const [element, previous] of this.inert) {
      if (next.has(element)) continue;
      if (previous === null) element.removeAttribute('inert');
      else element.setAttribute('inert', previous);
      this.inert.delete(element);
    }
    for (const element of next) {
      if (this.inert.has(element)) continue;
      this.inert.set(element, element.getAttribute('inert'));
      element.setAttribute('inert', '');
    }
  }

  private returnFocus(layer: Layer, parent: Layer | undefined) {
    if (layer.options().restoreFocus === false || layer.interactedOutside) return;
    if (layer.options().autoFocus === false && !layer.content.contains(this.document.activeElement)) return;
    // Layout cleanup precedes React selection restoration. A new layer/replay invalidates this return.
    queueMicrotask(() => {
      const manager = documents.get(this.document);
      if ((manager && manager !== this) || this.top() !== parent) return;
      const candidates = [layer.options().returnFocus?.(), layer.previous];
      if (!parent) {
        // An inline child can disappear with a hidden ancestor even while its own open prop stays true.
        for (const ancestor of [...this.layers].reverse()) {
          if (ancestor !== layer) candidates.push(ancestor.options().returnFocus?.(), ancestor.previous);
        }
      }
      for (const target of candidates) {
        if (
          target &&
          (!parent || parent.options().modal === false || this.contains(parent, target)) &&
          focusElement(target)
        )
          return;
      }
      if (parent) this.focusInside(parent);
      else {
        const body = this.document.body;
        const previous = body.getAttribute('tabindex');
        body.tabIndex = -1;
        focusElement(body);
        if (previous === null) body.removeAttribute('tabindex');
        else body.setAttribute('tabindex', previous);
      }
    });
  }

  private lockScroll() {
    const elements = [this.document.documentElement, this.document.body];
    const saved = elements.map((element) => ({
      element,
      overflow: element.style.getPropertyValue('overflow'),
      priority: element.style.getPropertyPriority('overflow'),
      overscroll: element.style.getPropertyValue('overscroll-behavior'),
      overscrollPriority: element.style.getPropertyPriority('overscroll-behavior'),
    }));
    for (const element of elements) {
      element.style.setProperty('overflow', 'hidden', 'important');
      element.style.setProperty('overscroll-behavior', 'none', 'important');
    }
    this.restoreScroll = () => {
      for (const entry of saved) {
        if (entry.overflow) entry.element.style.setProperty('overflow', entry.overflow, entry.priority);
        else entry.element.style.removeProperty('overflow');
        if (entry.overscroll)
          entry.element.style.setProperty('overscroll-behavior', entry.overscroll, entry.overscrollPriority);
        else entry.element.style.removeProperty('overscroll-behavior');
      }
    };
  }

  activate(content: HTMLElement) {
    const layer = this.layers.find((item) => item.content === content);
    if (!layer || !layer.options().activatable || layer.options().modal !== false || !isVisible(content)) return;
    const modal = this.modal();
    if (modal && !this.contains(modal, content)) return;
    const branch = this.descendants(layer);
    if (branch.includes(this.top()!)) return;
    this.layers = [...this.layers.filter((item) => !branch.includes(item)), ...branch];
    this.syncInert();
  }

  add(
    content: HTMLElement,
    options: () => LayerFocusOptions,
    scope: ModalFocusScope,
    onOrderChange?: (active: boolean, index: number) => void,
  ) {
    const layer: Layer = {
      scope,
      content,
      options,
      previous: this.document.activeElement as HTMLElement | null,
      lastFocused: null,
      interactedOutside: false,
      onOrderChange,
    };
    // Child layout effects can run before their parent's. A containing layer belongs underneath.
    const child = this.layers.findIndex((item) => {
      for (let ancestor = item.scope.parent; ancestor; ancestor = ancestor.parent) {
        if (ancestor === scope) return true;
      }
      return content.contains(item.content);
    });
    if (child < 0) this.layers.push(layer);
    else {
      layer.previous = this.layers[child]!.previous;
      this.layers.splice(child, 0, layer);
    }
    if (this.layers.length === 1) {
      this.document.addEventListener('keydown', this.keydown);
      this.document.addEventListener('focusin', this.focusin);
      this.document.addEventListener('pointerdown', this.pointerdown, true);
      this.document.addEventListener('click', this.click, true);
      this.observer.observe(this.document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['hidden', 'disabled', 'style', 'class', 'tabindex', 'open'],
      });
    }
    this.syncInert();
    if (this.top() === layer && options().autoFocus !== false) this.focusInside(layer, true);
    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      const wasTop = this.top() === layer;
      this.layers.splice(this.layers.indexOf(layer), 1);
      // Preserve the invoker chain when a lower layer disappears before its child.
      for (const item of this.layers) {
        if (item.previous && content.contains(item.previous)) item.previous = layer.previous;
      }
      this.syncInert();
      if (this.layers.length === 0) {
        this.observer.disconnect();
        this.document.removeEventListener('keydown', this.keydown);
        this.document.removeEventListener('focusin', this.focusin);
        this.document.removeEventListener('pointerdown', this.pointerdown, true);
        this.document.removeEventListener('click', this.click, true);
        this.restoreScroll?.();
        this.restoreScroll = undefined;
        documents.delete(this.document);
      }
      if (!wasTop) return;
      const parent = this.top();
      this.returnFocus(layer, parent);
    };
  }
}

export function registerModalLayer(
  content: HTMLElement,
  options: () => LayerFocusOptions,
  scope: ModalFocusScope,
  onOrderChange?: (active: boolean, index: number) => void,
) {
  const document = content.ownerDocument;
  let manager = documents.get(document);
  if (!manager) {
    manager = new ModalLayers(document);
    documents.set(document, manager);
  }
  return manager.add(content, options, scope, onOrderChange);
}

export function activateLayer(content: HTMLElement) {
  documents.get(content.ownerDocument)?.activate(content);
}
