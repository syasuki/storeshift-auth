// Supabase設定
const SUPABASE_URL = 'https://tetjzixfmrhahzwebqcb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldGp6aXhmbXJoYWh6d2VicWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNTM2ODcsImV4cCI6MjA2MzYyOTY4N30.uW390nPLRcOaSkBpO9ZxGJEUZRBXZYp3w-Cj8Gc-biM';

// Supabaseクライアントの初期化
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ローディング表示
function showLoading(message = '処理中...') {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');
    if (loading) {
        loading.style.display = 'block';
        const subtitle = loading.querySelector('.subtitle');
        if (subtitle) subtitle.textContent = message;
    }
    if (content) content.style.display = 'none';
}

// ローディング非表示
function hideLoading() {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';
}

// メッセージ表示
function showMessage(type, title, message) {
    hideLoading();
    const content = document.getElementById('content');

    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };

    content.innerHTML = `
        <div class="message">
            <div class="message-card ${type}-message">
                <span class="icon-large">${iconMap[type] || '📋'}</span>
                <h2 style="margin-bottom: 16px;">${title}</h2>
                <p style="font-size: 14px; line-height: 1.6;">${message}</p>
            </div>
        </div>
    `;
}

// URLパラメータを取得
function getUrlParams() {
    const queryParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    return {
        // クエリパラメータ
        tokenHash: queryParams.get('token_hash'),
        token: queryParams.get('token'), // 古い形式のtoken
        code: queryParams.get('code'), // PKCE認証フローの成功コード
        type: queryParams.get('type') || hashParams.get('type'),
        next: queryParams.get('next'),
        errorCode: queryParams.get('error_code') || hashParams.get('error_code'),
        errorDescription: queryParams.get('error_description') || hashParams.get('error_description'),

        // ハッシュパラメータ（従来形式）
        accessToken: hashParams.get('access_token'),
        refreshToken: hashParams.get('refresh_token'),
    };
}

// サインアップ確認処理（メール認証）
export async function handleSignupConfirmation() {
    showLoading('メールアドレスを確認中...');

    const params = getUrlParams();

    try {
        // エラーチェック
        if (params.errorCode) {
            // エラーコードに応じたメッセージを表示
            let errorMessage = 'メール確認に失敗しました';
            if (params.errorCode === 'otp_expired') {
                errorMessage = 'このリンクは有効期限が切れています。もう一度サインアップしてください。';
            } else if (params.errorCode === 'otp_disabled') {
                errorMessage = 'このリンクは無効です。';
            }
            throw new Error(params.errorDescription || errorMessage);
        }

        // Supabase Auth Confirmの新形式（推奨）
        if (params.tokenHash) {
            const { error } = await supabase.auth.verifyOtp({
                token_hash: params.tokenHash,
                type: params.type || 'signup'
            });

            if (error) {
                console.error('OTP verification error:', error);
                if (error.message.includes('expired')) {
                    throw new Error('確認リンクの有効期限が切れています。もう一度サインアップしてください。');
                }
                throw error;
            }

            // 確認成功 - アプリに戻るボタンと成功メッセージを表示
            showSuccessWithAppLink();
        }
        // 古い形式のtoken（Supabaseの旧認証システム）
        else if (params.token) {
            const { error } = await supabase.auth.verifyOtp({
                token: params.token,
                type: params.type || 'signup'
            });

            if (error) {
                console.error('OTP verification error:', error);
                if (error.message.includes('expired') || error.message.includes('invalid')) {
                    throw new Error('確認リンクの有効期限が切れているか無効です。もう一度サインアップしてください。');
                }
                throw error;
            }

            // 確認成功 - アプリに戻るボタンと成功メッセージを表示
            showSuccessWithAppLink();
        }
        // PKCE認証フローの成功（code パラメータ）
        else if (params.code) {

            // 確認成功 - アプリに戻るボタンと成功メッセージを表示
            showSuccessWithAppLink();
        }
        // 従来のハッシュフラグメント形式（後方互換性）
        else if (params.accessToken && params.refreshToken) {
            const { error } = await supabase.auth.setSession({
                access_token: params.accessToken,
                refresh_token: params.refreshToken
            });

            if (error) {
                console.error('Session error:', error);
                throw error;
            }

            // 確認成功
            showSuccessWithAppLink();
        }
        // パラメータが不足している場合
        else {
            console.error('Missing parameters:', params);
            throw new Error('認証情報が見つかりません。メールのリンクからアクセスしてください。');
        }
    } catch (error) {
        console.error('Signup confirmation error:', error);
        showMessage('error',
            'メール確認エラー',
            error.message || 'メール確認中にエラーが発生しました。もう一度お試しください。'
        );
    }
}

// メール確認成功時の表示
function showSuccessWithAppLink() {
    showMessage('success',
        'メール確認完了！',
        'メールアドレスの確認が完了しました。Store Shiftアプリに戻ってログインしてください。'
    );
}

// 旧メール確認処理（互換性のため残す）
export async function handleEmailConfirmation() {
    return handleSignupConfirmation();
}

// パスワード再設定処理
export async function handlePasswordReset() {
    const params = getUrlParams();

    // エラーチェック
    if (params.errorCode) {
        showMessage('error',
            'アクセスエラー',
            params.errorDescription || 'このリンクは無効または期限切れです。'
        );
        return;
    }

    // token_hashがある場合は先に検証して、成功したらフォーム表示
    if (params.tokenHash) {
        showLoading('認証を確認中...');
        try {
            // まず token_hash を検証
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: params.tokenHash,
                type: 'recovery'
            });

            if (error) {
                throw error;
            }

            // 検証成功後、フォーム表示
            showPasswordResetForm();
        } catch (error) {
            console.error('Token verification error:', error);
            showMessage('error',
                'リンクエラー',
                'このリンクは無効または期限切れです。もう一度パスワードリセットをお試しください。'
            );
        }
    }
    // アクセストークンがある場合（従来形式）
    else if (params.accessToken) {
        showLoading('認証を確認中...');
        try {
            const { error } = await supabase.auth.setSession({
                access_token: params.accessToken,
                refresh_token: params.refreshToken
            });

            if (error) throw error;

            showPasswordResetForm();
        } catch (error) {
            console.error('Session error:', error);
            showMessage('error',
                'リンクエラー',
                'このリンクは無効または期限切れです。もう一度パスワードリセットをお試しください。'
            );
        }
    } else {
        showMessage('error',
            'リンクエラー',
            '有効な認証トークンが見つかりません。メールのリンクからアクセスしてください。'
        );
    }
}

// パスワードリセットフォーム表示
function showPasswordResetForm() {
    hideLoading();
    const form = document.getElementById('resetPasswordForm');
    if (form) {
        form.style.display = 'block';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // エラーをクリア
            document.getElementById('passwordError').classList.remove('show');
            document.getElementById('confirmPasswordError').classList.remove('show');

            // バリデーション
            let hasError = false;

            if (password.length < 6) {
                document.getElementById('passwordError').textContent = 'パスワードは6文字以上で入力してください';
                document.getElementById('passwordError').classList.add('show');
                hasError = true;
            }

            if (password !== confirmPassword) {
                document.getElementById('confirmPasswordError').textContent = 'パスワードが一致しません';
                document.getElementById('confirmPasswordError').classList.add('show');
                hasError = true;
            }

            if (hasError) return;

            showLoading('パスワードを更新中...');

            try {
                // セッションが既に確立されているはずなので、直接更新
                const { error: updateError } = await supabase.auth.updateUser({
                    password: password
                });

                if (updateError) throw updateError;

                showMessage('success',
                    'パスワード更新完了',
                    'パスワードが正常に更新されました。アプリに戻ってログインしてください。'
                );
            } catch (error) {
                console.error('Password reset error:', error);
                showMessage('error',
                    '更新エラー',
                    error.message || 'パスワードの更新中にエラーが発生しました。'
                );
            }
        });
    }
}

// 招待処理
export async function handleInvite() {
    showLoading('招待を確認中...');

    const params = getUrlParams();

    // エラーチェック
    if (params.errorCode) {
        showMessage('error',
            'アクセスエラー',
            params.errorDescription || 'この招待リンクは無効または期限切れです。'
        );
        return;
    }

    // 招待フォーム表示
    hideLoading();
    const form = document.getElementById('inviteForm');
    if (form) {
        form.style.display = 'block';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // バリデーション
            if (password !== confirmPassword) {
                document.getElementById('confirmPasswordError').textContent = 'パスワードが一致しません';
                document.getElementById('confirmPasswordError').classList.add('show');
                return;
            }

            if (password.length < 6) {
                document.getElementById('passwordError').textContent = 'パスワードは6文字以上で入力してください';
                document.getElementById('passwordError').classList.add('show');
                return;
            }

            showLoading('アカウントを作成中...');

            try {
                // トークンハッシュがある場合（新形式）
                if (params.tokenHash) {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash: params.tokenHash,
                        type: 'invite'
                    });

                    if (error) throw error;

                    // パスワード設定
                    const { error: updateError } = await supabase.auth.updateUser({
                        password: password
                    });

                    if (updateError) throw updateError;
                }
                // アクセストークンがある場合（従来形式）
                else if (params.accessToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: params.accessToken,
                        refresh_token: params.refreshToken
                    });

                    if (error) throw error;

                    const { error: updateError } = await supabase.auth.updateUser({
                        password: password
                    });

                    if (updateError) throw updateError;
                } else {
                    throw new Error('有効な招待トークンが見つかりません');
                }

                showMessage('success',
                    'アカウント作成完了',
                    'アカウントが正常に作成されました。アプリに戻ってログインしてください。'
                );
            } catch (error) {
                console.error('Invite error:', error);
                showMessage('error',
                    '作成エラー',
                    error.message || 'アカウントの作成中にエラーが発生しました。'
                );
            }
        });
    }
}

// 汎用的な認証コールバック処理
export async function handleAuthCallback() {
    showLoading('認証処理中...');

    const params = getUrlParams();

    try {
        // エラーがある場合
        if (params.errorCode) {
            throw new Error(params.errorDescription || '認証処理に失敗しました');
        }

        // typeパラメータに基づいて処理を分岐
        switch (params.type) {
            case 'signup':
                // サインアップ確認ページにリダイレクト
                window.location.href = `/auth/confirm${window.location.search}${window.location.hash}`;
                break;

            case 'recovery':
                // パスワードリセットページにリダイレクト
                window.location.href = `/auth/reset-password${window.location.search}${window.location.hash}`;
                break;

            case 'invite':
                // 招待ページにリダイレクト
                window.location.href = `/auth/invite${window.location.search}${window.location.hash}`;
                break;

            case 'magiclink':
                // マジックリンクログイン処理
                if (params.tokenHash) {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash: params.tokenHash,
                        type: 'magiclink'
                    });

                    if (error) throw error;

                    showMessage('success',
                        'ログイン成功',
                        'ログインが完了しました。アプリに戻ってください。',
                        true
                    );
                } else if (params.accessToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: params.accessToken,
                        refresh_token: params.refreshToken
                    });

                    if (error) throw error;

                    showMessage('success',
                        'ログイン成功',
                        'ログインが完了しました。アプリに戻ってください。',
                        true
                    );
                } else {
                    throw new Error('有効な認証トークンが見つかりません');
                }
                break;

            default:
                // タイプが不明な場合でもトークンがあれば処理を試みる
                if (params.accessToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: params.accessToken,
                        refresh_token: params.refreshToken
                    });

                    if (error) throw error;

                    showMessage('success',
                        '認証成功',
                        '認証が完了しました。アプリに戻ってください。',
                        true
                    );
                } else {
                    throw new Error('処理タイプが不明です');
                }
        }
    } catch (error) {
        console.error('Auth callback error:', error);
        showMessage('error',
            '認証エラー',
            error.message || '認証処理中にエラーが発生しました。'
        );
    }
}