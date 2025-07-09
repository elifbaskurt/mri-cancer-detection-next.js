import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false; // Font Awesome'un kendi CSS'ini otomatik eklemesini engeller

export const metadata = {
  title: 'MRI Analysis',
  description: 'MRI ImageAnalysis Page',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
