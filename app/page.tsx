import { HomePage } from './components/HomePage';

// 根路径 '/' 会被 middleware 重定向到 /zh 或 /en；
// 此页面作为兜底渲染，不传 initialRelease，由客户端自行拉取 Release 数据。
export default function Home() {
  return <HomePage />;
}
