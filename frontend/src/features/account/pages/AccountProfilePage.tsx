import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch } from '../../../app/hooks';
import { Button } from '../../../shared/ui/system/Button';
import { Input } from '../../../shared/ui/system/Input';
import {
  useCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useUploadProfileImageMutation,
} from '../../auth/api/authApi';
import { setUserProfile } from '../../auth/slices/authSlice';
import { useMyOrdersQuery } from '../../orders/api/ordersApi';

const formatDateTime = (value?: string | null): string => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

export const AccountProfilePage = () => {
  const dispatch = useAppDispatch();
  const { data: user, isLoading: isLoadingUser, isError: userError } = useCurrentUserQuery();
  const { data: orders, isLoading: isLoadingOrders } = useMyOrdersQuery();
  const [updateCurrentUser, { isLoading: isSaving }] = useUpdateCurrentUserMutation();
  const [uploadProfileImage, { isLoading: isUploadingImage }] = useUploadProfileImageMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  const orderMetrics = useMemo(() => {
    const list = orders ?? [];
    const totalOrders = list.length;
    const paidOrders = list.filter((order) => order.isPaid).length;
    const deliveredOrders = list.filter((order) => order.isDelivered).length;
    const lifetimeValue = list.reduce((sum, order) => sum + order.totalPrice, 0);
    const latestOrderAt = list[0]?.createdAt;

    return {
      totalOrders,
      paidOrders,
      deliveredOrders,
      lifetimeValue,
      latestOrderAt,
    };
  }, [orders]);

  useEffect(() => {
    if (!user) return;
    setName((prev) => (prev ? prev : user.name));
    setEmail((prev) => (prev ? prev : user.email));
    setPhone((prev) => (prev ? prev : user.phone || ''));
    setDateOfBirth((prev) =>
      prev ? prev : user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
    );
    setLine1((prev) => (prev ? prev : user.address?.line1 || ''));
    setLine2((prev) => (prev ? prev : user.address?.line2 || ''));
    setCity((prev) => (prev ? prev : user.address?.city || ''));
    setStateField((prev) => (prev ? prev : user.address?.state || ''));
    setPostalCode((prev) => (prev ? prev : user.address?.postalCode || ''));
    setCountry((prev) => (prev ? prev : user.address?.country || ''));
  }, [user]);

  const onSelectProfileImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image must be 2MB or smaller.');
      return;
    }

    try {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
            return;
          }
          reject(new Error('Unexpected image payload format'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const result = await uploadProfileImage({ imageBase64 }).unwrap();
      dispatch(
        setUserProfile({
          ...user!,
          profileImageUrl: result.profileImageUrl,
        }),
      );
      setSuccessMessage('Profile image updated successfully.');
    } catch {
      setErrorMessage('Failed to upload profile image.');
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      dateOfBirth?: string | null;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
    } = {};
    const nextAddress = {
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: stateField.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
    };
    if (name.trim()) payload.name = name.trim();
    if (email.trim()) payload.email = email.trim();
    payload.phone = phone.trim();
    payload.dateOfBirth = dateOfBirth.trim() ? dateOfBirth.trim() : null;
    payload.address = nextAddress;
    if (newPassword.trim()) payload.password = newPassword.trim();

    try {
      const updatedUser = await updateCurrentUser(payload).unwrap();
      dispatch(setUserProfile(updatedUser));
      setSuccessMessage('Account profile updated successfully.');
      setNewPassword('');
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setPhone(updatedUser.phone || '');
      setDateOfBirth(
        updatedUser.dateOfBirth ? new Date(updatedUser.dateOfBirth).toISOString().slice(0, 10) : '',
      );
      setLine1(updatedUser.address?.line1 || '');
      setLine2(updatedUser.address?.line2 || '');
      setCity(updatedUser.address?.city || '');
      setStateField(updatedUser.address?.state || '');
      setPostalCode(updatedUser.address?.postalCode || '');
      setCountry(updatedUser.address?.country || '');
    } catch (err) {
      const message =
        (err as { data?: { error?: { message?: string }; message?: string } })?.data?.error
          ?.message ||
        (err as { data?: { error?: { message?: string }; message?: string } })?.data?.message ||
        'Failed to update account profile.';
      setErrorMessage(message);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex justify-center py-12">
        <span className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      >
        Failed to load account details.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section id="settings" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Profile management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Maintain your identity and account security details.
        </p>
        <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <img
            src={user.profileImageUrl || 'https://dummyimage.com/96x96/e2e8f0/64748b&text=User'}
            alt="Profile"
            className="size-20 rounded-full border border-slate-200 object-cover"
          />
          <div className="flex flex-col gap-2">
            <label className="inline-flex cursor-pointer items-center text-sm font-semibold text-primary hover:underline">
              Upload profile image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void onSelectProfileImage(event)}
                disabled={isUploadingImage}
              />
            </label>
            <span className="text-xs text-slate-500">PNG/JPG/WebP up to 2MB.</span>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <Input
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
          />
          <Input
            label="Date of birth"
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
          <h3 className="pt-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
            Address
          </h3>
          <Input
            label="Address line 1"
            value={line1}
            onChange={(event) => setLine1(event.target.value)}
          />
          <Input
            label="Address line 2"
            value={line2}
            onChange={(event) => setLine2(event.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" value={city} onChange={(event) => setCity(event.target.value)} />
            <Input
              label="State / Province"
              value={stateField}
              onChange={(event) => setStateField(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Postal code"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
            />
            <Input
              label="Country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            />
          </div>
          <Input
            id="change-password"
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            helperText="Leave blank to keep your current password."
          />

          {errorMessage ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
            >
              {errorMessage}
            </div>
          ) : null}
          {successMessage ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {successMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button
              shopVariant="secondary"
              type="button"
              onClick={() => {
                setName(user.name);
                setEmail(user.email);
                setPhone(user.phone || '');
                setDateOfBirth(
                  user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
                );
                setLine1(user.address?.line1 || '');
                setLine2(user.address?.line2 || '');
                setCity(user.address?.city || '');
                setStateField(user.address?.state || '');
                setPostalCode(user.address?.postalCode || '');
                setCountry(user.address?.country || '');
                setNewPassword('');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              Reset
            </Button>
            <Button shopVariant="primary" type="submit" loading={isSaving} disabled={isSaving}>
              Save profile
            </Button>
          </div>
        </form>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Account snapshot</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Role</dt>
              <dd className="font-medium text-slate-900">{user.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">User ID</dt>
              <dd
                className="max-w-[150px] truncate font-mono text-xs text-slate-900"
                title={user.id}
              >
                {user.id}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Total orders</dt>
              <dd className="font-medium text-slate-900">
                {isLoadingOrders ? '...' : orderMetrics.totalOrders}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Paid orders</dt>
              <dd className="font-medium text-slate-900">
                {isLoadingOrders ? '...' : orderMetrics.paidOrders}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Delivered</dt>
              <dd className="font-medium text-slate-900">
                {isLoadingOrders ? '...' : orderMetrics.deliveredOrders}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Lifetime spend</dt>
              <dd className="font-semibold text-slate-900">
                ${orderMetrics.lifetimeValue.toFixed(2)}
              </dd>
            </div>
            <div className="pt-1">
              <dt className="text-slate-600">Latest order</dt>
              <dd className="mt-1 text-slate-900">{formatDateTime(orderMetrics.latestOrderAt)}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Security and audit</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Last login</dt>
              <dd className="text-slate-900">
                {formatDateTime(user.security?.lastLoginAt ?? null)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Active sessions</dt>
              <dd className="font-medium text-slate-900">
                {user.security?.activeSessions?.length ?? 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">2FA status</dt>
              <dd className="font-medium text-slate-900">
                {user.security?.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
              </dd>
            </div>
          </dl>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            2FA configuration is a placeholder in this release. Contact support or an admin to
            enable enterprise MFA policies.
          </div>
          {securityNotice ? (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {securityNotice}
            </div>
          ) : null}
          <div className="mt-3">
            <Button
              shopVariant="secondary"
              size="small"
              onClick={() =>
                setSecurityNotice('Session revocation endpoint can be added next as needed.')
              }
            >
              Review session controls
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/account/orders"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Manage order history
            </Link>
            <Link to="/wishlist" className="text-sm font-semibold text-primary hover:underline">
              Review wishlist
            </Link>
            <Link to="/cart" className="text-sm font-semibold text-primary hover:underline">
              Return to cart
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
};
