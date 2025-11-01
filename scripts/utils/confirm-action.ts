export function confirmAction(message: string): boolean {
  const proceed = prompt(`${message}. Proceed? (Y/n)`);
  const allowed = proceed?.toLowerCase() === "y" || proceed === "";
  if (!allowed) {
    console.log("Aborting...");
    Deno.exit(0);
  }
  return true;
}