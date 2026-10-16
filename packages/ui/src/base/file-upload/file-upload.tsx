'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useFileUpload } from './use-file-upload';
import type { FileUploadApi, FileUploadOptions } from './use-file-upload';
import type { FileUploadFile } from './file-upload.machine';
const Context = createContext<FileUploadApi | null>(null);
function useFileUploadContext() {
  const api = useContext(Context);
  if (!api) throw new Error('File Upload parts must be inside FileUpload.Root.');
  return api;
}
export type FileUploadRootProps = FileUploadOptions & { children?: ReactNode };
export function FileUploadRoot({ children, ...options }: FileUploadRootProps) {
  return <Context value={useFileUpload(options)}>{children}</Context>;
}
export function FileUploadGroup(props: PartProps<'div'>) {
  return <div {...useFileUploadContext().getRootProps(props)} />;
}
export function FileUploadLabel(props: PartProps<'label'>) {
  const label = useFileUploadContext().getLabelProps(props);
  return <label {...label} htmlFor={label.htmlFor} />;
}
export function FileUploadDescription(props: PartProps<'span'>) {
  return <span {...useFileUploadContext().getDescriptionProps(props)} />;
}
export function FileUploadInput(props: PartProps<'input'>) {
  return <input {...useFileUploadContext().getInputProps(props)} />;
}
export function FileUploadTrigger(props: PartProps<'button'>) {
  return <button {...useFileUploadContext().getTriggerProps(props)} />;
}
export function FileUploadDropzone(props: PartProps<'div'>) {
  return <div {...useFileUploadContext().getDropzoneProps(props)} />;
}
export function FileUploadItem({ file, ...props }: PartProps<'li'> & { file: FileUploadFile }) {
  return <li {...useFileUploadContext().getItemProps(file, props)} />;
}
export function FileUploadRemove({ file, ...props }: PartProps<'button'> & { file: FileUploadFile }) {
  return <button {...useFileUploadContext().getRemoveProps(file, props)} />;
}
export function FileUploadFeedback(props: PartProps<'span'>) {
  return <span {...useFileUploadContext().getFeedbackProps(props)} />;
}
export function FileUploadValue({ children }: { children: (api: FileUploadApi) => ReactNode }) {
  return children(useFileUploadContext());
}
export const FileUpload = {
  Root: FileUploadRoot,
  Group: FileUploadGroup,
  Label: FileUploadLabel,
  Description: FileUploadDescription,
  Input: FileUploadInput,
  Trigger: FileUploadTrigger,
  Dropzone: FileUploadDropzone,
  Item: FileUploadItem,
  Remove: FileUploadRemove,
  Feedback: FileUploadFeedback,
  Value: FileUploadValue,
};
