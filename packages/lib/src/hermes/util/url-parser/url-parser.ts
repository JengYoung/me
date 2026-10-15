type URLQuery = Record<string, string | string[]>;

export class URLParser {
  private toURL(url: string): URL {
    try {
      return new URL(url);
    } catch {
      return new URL(decodeURIComponent(url));
    }
  }

  getQuery(url: string): URLQuery {
    const result: URLQuery = {};
    const parsedUrl = this.toURL(url);

    parsedUrl.searchParams.forEach((value, key) => {
      const previousValue = result[key];

      if (Array.isArray(previousValue)) {
        previousValue.push(value);
        return;
      }

      if (previousValue !== undefined) {
        result[key] = [previousValue, value];
        return;
      }

      result[key] = value;
    });

    return result;
  }

  getFragment(url: string): string {
    const parsedUrl = this.toURL(url);

    return decodeURIComponent(parsedUrl.hash.slice(1));
  }

  getOrigin(url: string): string {
    return this.toURL(url).origin;
  }
}
