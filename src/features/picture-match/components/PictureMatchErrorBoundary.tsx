import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class PictureMatchErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Picture Match Error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
                        遊戲發生錯誤
                    </h2>
                    <p style={{ color: '#666', marginBottom: '24px' }}>
                        抱歉，遊戲遇到了一些問題。請重新載入頁面。
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        重新載入
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
