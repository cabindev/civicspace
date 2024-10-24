//fonts/index.ts
import localFont from 'next/font/local'

export const seppuri = localFont({
  src: [
    {
      path: './Seppuri-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: './Seppuri-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './Seppuri-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Seppuri-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './Seppuri-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './Seppuri-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './Seppuri-ExtraLight.ttf',
      weight: '800',
      style: 'normal',
    }
  ],
  variable: '--font-seppuri' // สร้างตัวแปร CSS
})