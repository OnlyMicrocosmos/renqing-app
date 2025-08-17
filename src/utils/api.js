import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 添加请求拦截器来处理认证头
apiClient.interceptors.request.use(
    config => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 添加响应拦截器来处理401错误
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // 处理未授权错误
            console.log('Unauthorized access, redirecting to login');
            // 可以在这里重定向到登录页面
        }
        return Promise.reject(error);
    }
);

export default apiClient;