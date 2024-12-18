import { Link } from 'react-router-dom';
import useBreadcrumbs from 'use-react-router-breadcrumbs';

// 路徑與名稱對應的對照表
const routes = [
    { path: '/', breadcrumb: 'Home' },
    { path: '/books', breadcrumb: 'Books' },
];

// 解碼 URL
const decodeBreadcrumb = (encoded) => decodeURIComponent(encoded);

export default function Breadcrumbs() {
    // 使用 useBreadcrumbs 並傳入對照表
    const breadcrumbs = useBreadcrumbs(routes);

    return (
        <div className='container p-4'>
            {breadcrumbs.map(({ breadcrumb, match }, index) => {
                // 如果 breadcrumb 是自定義的就直接顯示，否則解碼路徑中的最後部分
                const displayText = routes.find(r => r.path === match.pathname)
                    ? breadcrumb
                    : decodeBreadcrumb(breadcrumb.key.split('/').pop());

                return (
                    <span key={match.pathname}>
                        <Link to={match.pathname}>{displayText}</Link>
                        {index < breadcrumbs.length - 1 && ' / '}
                    </span>
                );
            })}
        </div>
    );
}
