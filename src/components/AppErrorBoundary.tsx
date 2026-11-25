import { Component, type ErrorInfo, type JSX, type ReactNode } from 'react';
import { clearAllCilukbaStorage } from '../lib/profilesStorage.ts';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Keep error handling strictly local with zero external telemetry
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleSafeReset = (): void => {
    clearAllCilukbaStorage();
    window.location.reload();
  };

  render(): JSX.Element | ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="error-boundary-shell" role="alert">
        <div className="error-boundary-card">
          <span className="eyebrow">Pemulihan Cilukba</span>
          <h1>Ups, ada kendala sementara</h1>
          <p className="muted-copy">
            Halaman mengalami gangguan tak terduga. Data anak Anda tersimpan lokal di perangkat — coba muat ulang dulu.
          </p>
          <div className="error-boundary-actions">
            <button type="button" className="btn-primary-calm" onClick={this.handleReload}>
              Muat Ulang Aplikasi
            </button>
            <button type="button" className="btn-outline" onClick={this.handleSafeReset}>
              Reset Data Lokal (Darurat)
            </button>
          </div>
        </div>
      </div>
    );
  }
}
