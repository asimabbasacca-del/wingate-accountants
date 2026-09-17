export function securityLog(event: string, detail: Record<string, unknown> = {}): void {
  console.info(
    JSON.stringify({
      ts: new Date().toISOString(),
      src: "wingate-security",
      event,
      ...detail,
    }),
  );
}
