function toFriendlyMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid') && (lower.includes('email') || lower.includes('password')))
    return 'Invalid email or password. Please try again.';
  if (lower.includes('user not found'))
    return "We couldn't find an account with that email. Would you like to create one?";
  if (lower.includes('already have a borrowed book') || lower.includes('return it first'))
    return "You've got a book with you already! Please return it first, then you can borrow another one.";
  if (lower.includes('not available for borrowing'))
    return "This book isn't available right now. Someone else has borrowed it. Check back later!";
  if (lower.includes('book not found'))
    return "We couldn't find that book. It may have been removed.";
  if (lower.includes('currently borrowed') && lower.includes('delet'))
    return "This book is currently borrowed by someone. Please wait until it's returned before removing it.";
  if (lower.includes('cannot be deleted') && lower.includes('borrowing records'))
    return "This book has borrowing history, so it can't be deleted.";
  if (lower.includes('server error') || lower.includes('500'))
    return 'Something went wrong on our end. Please try again in a moment.';
  return msg;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;

    if (e['error'] instanceof ProgressEvent) return fallback;

    let raw = fallback;
    const body = e['error'];
    if (typeof body === 'string' && body.trim()) raw = body;
    else if (body && typeof body === 'object') {
      const b = body as Record<string, unknown>;
      const msg = (b['message'] ?? b['Message'] ?? b['error_description'] ?? b['error']) as
        | string
        | undefined;
      if (typeof msg === 'string' && msg.trim()) raw = msg;
      else {
        const errors = b['errors'] as Record<string, string[]> | string[] | undefined;
        if (errors && typeof errors === 'object') {
          const arr = Array.isArray(errors) ? errors : Object.values(errors).flat();
          const first = arr.find((x): x is string => typeof x === 'string' && x.trim().length > 0);
          if (first) raw = first;
        }
      }
    }

    const status = e['status'] as number | undefined;
    if (typeof status === 'number') {
      if (status === 401) return "The email or password doesn't seem right. Please try again.";
      if (status === 403) return "You don't have permission for this action.";
      if (status >= 500) return 'Something went wrong. Please try again in a moment.';
    }

    const topMsg = (e['message'] ?? e['Message']) as string | undefined;
    if (typeof topMsg === 'string' && topMsg.trim() && !topMsg.includes('Http failure')) {
      raw = topMsg;
    }

    return toFriendlyMessage(raw);
  }

  return fallback;
}