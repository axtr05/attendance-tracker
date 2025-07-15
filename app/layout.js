import './globals.css'

export const metadata = {
  title: 'Attendance Tracker',
  description: 'Track your college attendance with precision and ease',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}