import Script from "next/script";
import React from "react";

const ThemeScript = () => {
  return (
    <Script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
                (function() {
                  try {
                    var theme = localStorage.getItem('theme');
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    var finalTheme = theme === 'system' || !theme ? systemTheme : theme;
                    document.documentElement.classList.add(finalTheme);
                  } catch (e) {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    document.documentElement.classList.add(systemTheme);
                  }
                })();
              `,
      }}
    />
  );
};

export default ThemeScript;
