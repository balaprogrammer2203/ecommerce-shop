export type CategoryItem = {
  label: string;
  to: string;
};

export type Subcategory = {
  label: string;
  children: CategoryItem[];
};

export type Category = {
  label: string;
  children: Subcategory[];
};

export const categories: Category[] = [
  {
    label: 'Electronics',
    children: [
      {
        label: 'Mobiles',
        children: [
          { label: 'Android Phones', to: '/?category=electronics&sub=mobiles&item=android' },
          { label: 'iPhones', to: '/?category=electronics&sub=mobiles&item=iphone' },
        ],
      },
      {
        label: 'Computers',
        children: [
          { label: 'Laptops', to: '/?category=electronics&sub=computers&item=laptops' },
          { label: 'Desktops', to: '/?category=electronics&sub=computers&item=desktops' },
        ],
      },
    ],
  },
  {
    label: 'Fashion',
    children: [
      {
        label: 'Men',
        children: [
          { label: 'T-Shirts', to: '/?category=fashion&sub=men&item=tshirts' },
          { label: 'Shoes', to: '/?category=fashion&sub=men&item=shoes' },
        ],
      },
      {
        label: 'Women',
        children: [
          { label: 'Dresses', to: '/?category=fashion&sub=women&item=dresses' },
          { label: 'Handbags', to: '/?category=fashion&sub=women&item=handbags' },
        ],
      },
    ],
  },
  {
    label: 'Home & Kitchen',
    children: [
      {
        label: 'Appliances',
        children: [
          { label: 'Microwaves', to: '/?category=home&sub=appliances&item=microwaves' },
          { label: 'Vacuum Cleaners', to: '/?category=home&sub=appliances&item=vacuum' },
        ],
      },
      {
        label: 'Decor',
        children: [
          { label: 'Wall Art', to: '/?category=home&sub=decor&item=wallart' },
          { label: 'Lighting', to: '/?category=home&sub=decor&item=lighting' },
        ],
      },
    ],
  },
];
