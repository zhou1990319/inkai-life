import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/**
 * 鑾峰彇鍒濆涓婚
 * 浼樺厛浠?DOM 涓婅鍙栫埗绐楀彛鍙兘宸茶缃殑涓婚锛岄伩鍏嶉棯鐑? */
function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light';

  // 妫€鏌?document.documentElement 涓婃槸鍚﹀凡鏈変富棰樼被鎴栧睘鎬?  const dataTheme = document.documentElement.getAttribute('data-theme');
  if (dataTheme === 'dark' || dataTheme === 'light') {
    return dataTheme;
  }

  // 妫€鏌ョ被鍚?  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  if (document.documentElement.classList.contains('light')) {
    return 'light';
  }

  // 榛樿 light
  return 'light';
}

/**
 * 鐩戝惉鐖剁獥鍙ｇ殑涓婚鍒囨崲娑堟伅
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // 鐩戝惉鏉ヨ嚜鐖剁獥鍙ｇ殑涓婚鍒囨崲娑堟伅
    const handleMessage = (event: MessageEvent) => {
      // 瀹夊叏鎬ф鏌ワ細鍙牴鎹渶瑕侀獙璇?event.origin
      if (event.data && typeof event.data.theme === 'string') {
        const newTheme = event.data.theme as Theme;
        if (newTheme === 'light' || newTheme === 'dark') {
          setTheme(newTheme);
          // 搴旂敤涓婚鍒癉OM
          applyTheme(newTheme);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // 鍒濆鍖栨椂搴旂敤褰撳墠涓婚鍒癉OM锛堢‘淇濋娆℃覆鏌撴纭級
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return theme;
}

/**
 * 搴旂敤涓婚鍒癉OM
 */
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  // 绉婚櫎鏃х殑涓婚绫?  document.documentElement.classList.remove('light', 'dark');
  // 娣诲姞鏂扮殑涓婚绫?  document.documentElement.classList.add(theme);
  // 璁剧疆data-theme灞炴€?  document.documentElement.setAttribute('data-theme', theme);
}
