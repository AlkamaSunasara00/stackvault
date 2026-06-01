import toast from 'react-hot-toast'

export async function copyToClipboard(
  text: string,
  successMessage = 'Copied to clipboard!'
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(successMessage, {
      duration: 2000,
      style: {
        background: '#161E2E',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
      },
      iconTheme: {
        primary: '#22C55E',
        secondary: '#161E2E',
      },
    })
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    try {
      document.execCommand('copy')
      toast.success(successMessage, { duration: 2000 })
    } catch {
      toast.error('Failed to copy to clipboard')
    }
    document.body.removeChild(textarea)
  }
}
