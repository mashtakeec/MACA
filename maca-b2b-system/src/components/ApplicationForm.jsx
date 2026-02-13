import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { validateEmail, validatePhone } from '../utils/validation';

/**
 * MACA堂B2B申込フォーム
 * 新規顧客の申込を受け付ける公開フォーム
 */
const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    business_type: '',
    terms_agreed: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // フォーム入力ハンドラー
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = '会社名は必須です';
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = '担当者名は必須です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = '有効な電話番号を入力してください';
    }

    if (!formData.business_type) {
      newErrors.business_type = '業種を選択してください';
    }

    if (!formData.terms_agreed) {
      newErrors.terms_agreed = '利用規約に同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          company_name: formData.company_name.trim(),
          contact_name: formData.contact_name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          business_type: formData.business_type,
          terms_agreed: formData.terms_agreed,
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') { // unique constraint violation
          setErrors({ email: 'このメールアドレスは既に登録されています' });
        } else {
          throw error;
        }
      } else {
        setSubmitSuccess(true);
        // フォームをリセット
        setFormData({
          company_name: '',
          contact_name: '',
          email: '',
          phone: '',
          address: '',
          business_type: '',
          terms_agreed: false
        });
      }
    } catch (error) {
      console.error('申込送信エラー:', error);
      setErrors({ submit: '申込の送信に失敗しました。しばらく後にもう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 成功画面
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">申込を受け付けました</h2>
          <p className="text-gray-600 mb-6">
            この度はMACA堂にお申込みいただき、ありがとうございます。<br />
            担当者より3営業日以内にご連絡いたします。
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            新しい申込を行う
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MACA堂 B2B取引申込</h1>
        <p className="text-gray-600">
          法人向けポーション卸売りサービスへのお申込みフォームです。<br />
          審査完了後、専用システムをご利用いただけます。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 会社名 */}
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
            会社名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.company_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="株式会社○○○"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
          )}
        </div>

        {/* 担当者名 */}
        <div>
          <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
            担当者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contact_name"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.contact_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="山田 太郎"
          />
          {errors.contact_name && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_name}</p>
          )}
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="yamada@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* 電話番号 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="03-1234-5678"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* 住所 */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            住所
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="〒100-0001 東京都千代田区千代田1-1-1"
          />
        </div>

        {/* 業種 */}
        <div>
          <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-1">
            業種 <span className="text-red-500">*</span>
          </label>
          <select
            id="business_type"
            name="business_type"
            value={formData.business_type}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.business_type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">選択してください</option>
            <option value="冒険者ギルド">冒険者ギルド</option>
            <option value="魔法学院">魔法学院</option>
            <option value="騎士団">騎士団</option>
            <option value="商会">商会</option>
            <option value="医療機関">医療機関</option>
            <option value="研究機関">研究機関</option>
            <option value="その他">その他</option>
          </select>
          {errors.business_type && (
            <p className="mt-1 text-sm text-red-600">{errors.business_type}</p>
          )}
        </div>

        {/* 利用規約同意 */}
        <div>
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="terms_agreed"
              checked={formData.terms_agreed}
              onChange={handleInputChange}
              className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                errors.terms_agreed ? 'border-red-500' : ''
              }`}
            />
            <span className="text-sm text-gray-700">
              <span className="text-red-500">*</span> 
              <a href="#" className="text-blue-600 hover:underline">利用規約</a>
              および
              <a href="#" className="text-blue-600 hover:underline">プライバシーポリシー</a>
              に同意します
            </span>
          </label>
          {errors.terms_agreed && (
            <p className="mt-1 text-sm text-red-600">{errors.terms_agreed}</p>
          )}
        </div>

        {/* 送信エラー */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? '送信中...' : '申込を送信'}
          </button>
        </div>
      </form>

      {/* 注意事項 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">ご注意</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 審査には3-5営業日程度お時間をいただきます</li>
          <li>• 審査結果はメールにてご連絡いたします</li>
          <li>• 法人のお客様のみご利用いただけます</li>
          <li>• 最小注文金額は10,000円からとなります</li>
        </ul>
      </div>
    </div>
  );
};

export default ApplicationForm;

