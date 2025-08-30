import FeaturedProducts from "./_components/FeaturedProducts";
import CartView from "./CartView";

export default function CartPage() {
  return (
    <>
      <CartView />
      <div className="mt-16">
        <FeaturedProducts />
      </div>
    </>
  );
}
