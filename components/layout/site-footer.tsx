export function SiteFooter() {
    return (
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600">
          <div className="flex flex-col gap-2 md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} HappyRealtor</p>
  
            <div className="flex gap-4">
              <a href="/about">About</a>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }