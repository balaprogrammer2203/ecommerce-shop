import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
  fetchActiveCategoryTree,
  type BackendCategoryTreeNode,
} from '../../lib/categoryTreeClient';
import { cn } from '../../lib/cn';
import { IconChevronDown } from '../icons/storefront';

type MenuVariant = 'light' | 'dark';

type CategoryMenuProps = {
  variant?: MenuVariant;
};

export const CategoryMenu = ({ variant = 'light' }: CategoryMenuProps) => {
  const [popover, setPopover] = useState<{
    root: BackendCategoryTreeNode;
    left: number;
    top: number;
  } | null>(null);
  const [tree, setTree] = useState<BackendCategoryTreeNode[] | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchActiveCategoryTree()
      .then((data) => {
        if (!mounted) return;
        setTree(data);
      })
      .catch(() => {
        if (!mounted) return;
        setTree([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const roots = tree ?? [];

  const openCategoryMenu = (e: React.MouseEvent<HTMLElement>, root: BackendCategoryTreeNode) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPopover({
      root,
      left: Math.max(12, Math.min(r.left, window.innerWidth - 720)),
      top: r.bottom + 6,
    });
  };

  const closeAll = () => setPopover(null);

  useEffect(() => {
    if (!popover) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') closeAll();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popover]);

  const rootChildren = useMemo(() => popover?.root.children ?? [], [popover?.root]);

  const btnLight =
    'rounded-full px-3 py-2 text-[13px] font-bold text-slate-900 min-h-9 hover:bg-primary/10 hover:text-primary';
  const btnDark =
    'rounded-full px-3 py-2 text-[13px] font-bold text-slate-50 min-h-9 hover:bg-white/10';

  return (
    <>
      <div className="flex flex-nowrap items-center justify-start gap-2 overflow-x-auto border-0 bg-transparent py-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {roots.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={(e) => openCategoryMenu(e, cat)}
            aria-haspopup="dialog"
            aria-expanded={popover?.root._id === cat._id}
            className={cn(
              'inline-flex items-center gap-0.5 border-0 bg-transparent',
              variant === 'dark' ? btnDark : btnLight,
            )}
          >
            {cat.name}
            <IconChevronDown size={18} className="opacity-70" aria-hidden />
          </button>
        ))}
      </div>

      {popover ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close category menu"
            onClick={closeAll}
          />
          <div
            role="dialog"
            aria-label={popover.root.name}
            className="fixed z-50 max-h-[min(420px,calc(100vh-48px))] w-[min(920px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl"
            style={{ left: popover.left, top: popover.top }}
          >
            <div className="max-h-[420px] overflow-auto p-4">
              <p className="mb-1 px-1 text-base font-black text-slate-900">{popover.root.name}</p>
              <hr className="mb-3 border-slate-200" />
              {rootChildren.length ? (
                <div className="grid max-h-[360px] grid-cols-1 gap-4 overflow-auto pr-1 sm:grid-cols-2 md:grid-cols-3">
                  {rootChildren.map((l2) => {
                    const l3 = l2.children ?? [];
                    return (
                      <div key={l2._id}>
                        <p className="mb-2 text-[13px] font-black text-slate-900">{l2.name}</p>
                        <div className="flex flex-col gap-0.5">
                          {(l3.length ? l3 : [l2]).map((leaf) => (
                            <RouterLink
                              key={leaf._id}
                              to={`/category/${leaf.slug}`}
                              onClick={closeAll}
                              className="py-0.5 text-[13px] text-slate-600 no-underline hover:text-primary hover:underline"
                            >
                              {leaf.name}
                            </RouterLink>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="p-2 text-sm text-slate-600">No categories available.</p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};
