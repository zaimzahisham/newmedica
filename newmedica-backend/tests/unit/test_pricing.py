import uuid
import pytest
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.models import User, UserType, Product, Category
from app.models.voucher import Voucher, VoucherProductLink
from app.models.cart import Cart, CartItem
from app.models.shipping_config import ShippingConfig  # to be implemented
from app.services.pricing_service import PricingService  # to be implemented


@pytest.mark.asyncio
async def test_healthcare_rm20_off_barrier_cream_with_shipping(session: AsyncSession):
    # Arrange: user type Healthcare, product Barrier Cream, voucher RM20 off product
    healthcare_type = (await session.execute(select(UserType).where(UserType.name == "Healthcare"))).scalar_one_or_none()
    if not healthcare_type:
        healthcare_type = UserType(name="Healthcare")
        session.add(healthcare_type)
        await session.commit()
        await session.refresh(healthcare_type)

    user = User(email=f"hc_{uuid.uuid4()}@test.com", password_hash="x", user_type_id=healthcare_type.id)
    session.add(user)
    await session.commit()
    await session.refresh(user)

    cat = Category(name="TestCat", description="")
    session.add(cat)
    await session.commit()
    await session.refresh(cat)

    barrier = Product(
        id=uuid.UUID("9f487ce0-a98f-49f0-9445-564ae0fc0c73"),
        name="Med-Cover Barrier Cream, 120g",
        description="Durable and transparent barrier cream for skin protection.",
        price=59.90,
        stock=100,
        category_id=cat.id,
    )
    session.add(barrier)
    await session.commit()

    # Voucher: -20 fixed for barrier, min qty 1, per-unit False
    v = Voucher(
        code="HEALTHCARE_BARRIER_RM20",
        discount_type="fixed",
        amount=20.0,
        scope="product_list",
        target_user_type_id=healthcare_type.id,
        min_quantity=1,
        per_unit=False,
        is_active=True,
    )
    session.add(v)
    await session.commit()
    await session.refresh(v)
    session.add(VoucherProductLink(voucher_id=v.id, product_id=barrier.id))

    # Shipping config: first 6, additional 2
    session.add(ShippingConfig(base_fee_first_item=6.0, additional_fee_per_item=2.0, is_active=True))
    await session.commit()

    # Cart: 2 barrier creams
    cart = Cart(user_id=user.id)
    session.add(cart)
    await session.commit()
    await session.refresh(cart)
    session.add(CartItem(cart_id=cart.id, product_id=barrier.id, quantity=2))
    await session.commit()

    pricing = PricingService(session)
    totals = await pricing.compute_totals(user_id=user.id)

    # Subtotal = 2 * 59.9 = 119.8
    # Discount = 20.0 (order-level because per_unit=False)
    # Shipping = 6 + 2*(2-1) = 8
    # Total = 119.8 - 20 + 8 = 107.8
    assert round(totals["subtotal"], 2) == 119.80
    assert round(totals["discount"], 2) == 20.00
    assert round(totals["shipping"], 2) == 8.00
    assert round(totals["total"], 2) == 107.80


@pytest.mark.asyncio
async def test_agent_rm40_per_unit_if_qty10plus(session: AsyncSession):
    # Arrange Agent type
    agent_type = (await session.execute(select(UserType).where(UserType.name == "Agent"))).scalar_one_or_none()
    if not agent_type:
        agent_type = UserType(name="Agent")
        session.add(agent_type)
        await session.commit()
        await session.refresh(agent_type)

    user = User(email=f"agent_{uuid.uuid4()}@test.com", password_hash="x", user_type_id=agent_type.id)
    session.add(user)
    await session.commit()
    await session.refresh(user)

    cat = Category(name="TestCat2", description="")
    session.add(cat)
    await session.commit()
    await session.refresh(cat)

    barrier = (await session.execute(select(Product).where(Product.id == uuid.UUID("9f487ce0-a98f-49f0-9445-564ae0fc0c73")))).scalar_one_or_none()
    if not barrier:
        barrier = Product(
            id=uuid.UUID("9f487ce0-a98f-49f0-9445-564ae0fc0c73"),
            name="Med-Cover Barrier Cream, 120g",
            description="Durable and transparent barrier cream for skin protection.",
            price=59.90,
            stock=100,
            category_id=cat.id,
        )
        session.add(barrier)
        await session.commit()

    # Voucher: -40 per unit if qty >= 10, per_unit True
    v = Voucher(
        code="AGENT_BARRIER_RM40_PER_10PLUS",
        discount_type="fixed",
        amount=40.0,
        scope="product_list",
        target_user_type_id=agent_type.id,
        min_quantity=10,
        per_unit=True,
        is_active=True,
    )
    session.add(v)
    await session.commit()
    await session.refresh(v)
    session.add(VoucherProductLink(voucher_id=v.id, product_id=barrier.id))

    # Shipping config: first 6, additional 2
    session.add(ShippingConfig(base_fee_first_item=6.0, additional_fee_per_item=2.0, is_active=True))
    await session.commit()

    # Cart: 10 barrier creams
    cart = Cart(user_id=user.id)
    session.add(cart)
    await session.commit()
    await session.refresh(cart)
    session.add(CartItem(cart_id=cart.id, product_id=barrier.id, quantity=10))
    await session.commit()

    pricing = PricingService(session)
    totals = await pricing.compute_totals(user_id=user.id)

    # Subtotal = 10 * 59.9 = 599.0
    # Discount = 40 * 10 = 400.0
    # Shipping = 6 + 2*(10-1) = 24
    # Total = 599 - 400 + 24 = 223
    assert round(totals["subtotal"], 2) == 599.00
    assert round(totals["discount"], 2) == 400.00
    assert round(totals["shipping"], 2) == 24.00
    assert round(totals["total"], 2) == 223.00


@pytest.mark.asyncio
async def test_no_voucher_shipping_zero(session: AsyncSession):
    # Basic user with product, no vouchers
    basic_type = (await session.execute(select(UserType).where(UserType.name == "Basic"))).scalar_one_or_none()
    if not basic_type:
        basic_type = UserType(name="Basic")
        session.add(basic_type)
        await session.commit()
        await session.refresh(basic_type)
    user = User(email=f"basic_{uuid.uuid4()}@test.com", password_hash="x", user_type_id=basic_type.id)
    session.add(user)
    await session.commit()
    await session.refresh(user)

    cat = Category(name="Cat0", description="")
    session.add(cat)
    await session.commit()
    await session.refresh(cat)

    p = Product(name="P0", description="d", price=10.0, stock=100, category_id=cat.id)
    session.add(p)
    await session.commit()

    # shipping config zero
    session.add(ShippingConfig(base_fee_first_item=0.0, additional_fee_per_item=0.0, is_active=True))
    await session.commit()

    cart = Cart(user_id=user.id)
    session.add(cart)
    await session.commit()
    await session.refresh(cart)
    session.add(CartItem(cart_id=cart.id, product_id=p.id, quantity=3))
    await session.commit()

    totals = await PricingService(session).compute_totals(user.id)
    assert totals["subtotal"] == 30.0
    assert totals["discount"] == 0.0
    assert totals["shipping"] == 0.0
    assert totals["total"] == 30.0


@pytest.mark.asyncio
async def test_user_type_mismatch_no_discount(session: AsyncSession):
    # Voucher for Healthcare should not apply to Basic
    basic_type = (await session.execute(select(UserType).where(UserType.name == "Basic"))).scalar_one_or_none()
    if not basic_type:
        basic_type = UserType(name="Basic")
        session.add(basic_type)
        await session.commit()
        await session.refresh(basic_type)
    hc_type = (await session.execute(select(UserType).where(UserType.name == "Healthcare"))).scalar_one_or_none()
    if not hc_type:
        hc_type = UserType(name="Healthcare")
        session.add(hc_type)
        await session.commit()
        await session.refresh(hc_type)

    user = User(email=f"basic2_{uuid.uuid4()}@test.com", password_hash="x", user_type_id=basic_type.id)
    session.add(user)
    await session.commit()
    await session.refresh(user)

    cat = Category(name="Cat1", description="")
    session.add(cat)
    await session.commit()
    await session.refresh(cat)
    p = Product(name="P1", description="d", price=50.0, stock=100, category_id=cat.id)
    session.add(p)
    await session.commit()

    v = Voucher(code="HC_ONLY", discount_type="fixed", amount=10.0, scope="product_list", target_user_type_id=hc_type.id, min_quantity=1, per_unit=False, is_active=True)
    session.add(v)
    await session.commit()
    await session.refresh(v)
    session.add(VoucherProductLink(voucher_id=v.id, product_id=p.id))
    await session.commit()

    session.add(ShippingConfig(base_fee_first_item=0.0, additional_fee_per_item=0.0, is_active=True))
    await session.commit()

    cart = Cart(user_id=user.id)
    session.add(cart)
    await session.commit()
    await session.refresh(cart)
    session.add(CartItem(cart_id=cart.id, product_id=p.id, quantity=1))
    await session.commit()

    totals = await PricingService(session).compute_totals(user.id)
    assert totals["subtotal"] == 50.0
    assert totals["discount"] == 0.0
    assert totals["total"] == 50.0


@pytest.mark.asyncio
async def test_min_quantity_edge(session: AsyncSession):
    agent_type = (await session.execute(select(UserType).where(UserType.name == "Agent"))).scalar_one_or_none()
    if not agent_type:
        agent_type = UserType(name="Agent")
        session.add(agent_type)
        await session.commit()
        await session.refresh(agent_type)
    user = User(email=f"agent2_{uuid.uuid4()}@test.com", password_hash="x", user_type_id=agent_type.id)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    cat = Category(name="Cat2", description="")
    session.add(cat)
    await session.commit()
    await session.refresh(cat)
    p = Product(name="P2", description="d", price=20.0, stock=100, category_id=cat.id)
    session.add(p)
    await session.commit()

    v = Voucher(code="AG_Q10", discount_type="fixed", amount=5.0, scope="product_list", target_user_type_id=agent_type.id, min_quantity=10, per_unit=True, is_active=True)
    session.add(v)
    await session.commit()
    await session.refresh(v)
    session.add(VoucherProductLink(voucher_id=v.id, product_id=p.id))
    await session.commit()

    session.add(ShippingConfig(base_fee_first_item=0.0, additional_fee_per_item=0.0, is_active=True))
    await session.commit()

    # qty 9 -> no discount
    cart = Cart(user_id=user.id)
    session.add(cart)
    await session.commit()
    await session.refresh(cart)
    session.add(CartItem(cart_id=cart.id, product_id=p.id, quantity=9))
    await session.commit()
    totals = await PricingService(session).compute_totals(user.id)
    assert totals["subtotal"] == 180.0
    assert totals["discount"] == 0.0
    assert totals["total"] == 180.0

    # adjust to 10 -> discount applies: 5*10
    result = await session.execute(select(CartItem).where(CartItem.cart_id == cart.id))
    ci = result.scalar_one()
    ci.quantity = 10
    session.add(ci)
    await session.commit()
    totals = await PricingService(session).compute_totals(user.id)
    assert totals["subtotal"] == 200.0
    assert totals["discount"] == 50.0
    assert totals["total"] == 200.0 - 50.0


@pytest.mark.asyncio
async def test_multiple_products_only_eligible_discounted(session: AsyncSession):
    hc_type = (await session.execute(select(UserType).where(UserType.name == "Healthcare"))).scalar_one_or_none()
    if not hc_type:
        hc_type = UserType(name="Healthcare")
        session.add(hc_type)
        await session.commit()
        await session.refresh(hc_type)
    user = User(email=f"hc2_{uuid.uuid4()}@test.com", password_hash="x", user_type_id=hc_type.id)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    cat = Category(name="Cat3", description="")
    session.add(cat)
    await session.commit()
    await session.refresh(cat)
    p1 = Product(name="Eligible", description="d", price=30.0, stock=100, category_id=cat.id)
    p2 = Product(name="Other", description="d", price=70.0, stock=100, category_id=cat.id)
    session.add(p1)
    session.add(p2)
    await session.commit()

    v = Voucher(code="HC_RM10", discount_type="fixed", amount=10.0, scope="product_list", target_user_type_id=hc_type.id, min_quantity=1, per_unit=False, is_active=True)
    session.add(v)
    await session.commit()
    await session.refresh(v)
    session.add(VoucherProductLink(voucher_id=v.id, product_id=p1.id))
    await session.commit()

    session.add(ShippingConfig(base_fee_first_item=0.0, additional_fee_per_item=0.0, is_active=True))
    await session.commit()

    cart = Cart(user_id=user.id)
    session.add(cart)
    await session.commit()
    await session.refresh(cart)
    session.add(CartItem(cart_id=cart.id, product_id=p1.id, quantity=1))
    session.add(CartItem(cart_id=cart.id, product_id=p2.id, quantity=1))
    await session.commit()

    totals = await PricingService(session).compute_totals(user.id)
    # subtotal = 100, discount = 10
    assert totals["subtotal"] == 100.0
    assert totals["discount"] == 10.0
    assert totals["total"] == 90.0


@pytest.mark.asyncio
async def test_percent_voucher_on_overall_subtotal(session: AsyncSession):
    # Current implementation applies percent on overall subtotal (simplified)
    hc_type = (await session.execute(select(UserType).where(UserType.name == "Healthcare"))).scalar_one_or_none()
    if not hc_type:
        hc_type = UserType(name="Healthcare")
        session.add(hc_type)
        await session.commit()
        await session.refresh(hc_type)
    user = User(email=f"hc3_{uuid.uuid4()}@test.com", password_hash="x", user_type_id=hc_type.id)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    cat = Category(name="Cat4", description="")
    session.add(cat)
    await session.commit()
    await session.refresh(cat)
    p1 = Product(name="A", description="d", price=100.0, stock=100, category_id=cat.id)
    p2 = Product(name="B", description="d", price=50.0, stock=100, category_id=cat.id)
    session.add(p1)
    session.add(p2)
    await session.commit()

    v = Voucher(code="PCT10", discount_type="percent", amount=10.0, scope="product_list", target_user_type_id=hc_type.id, min_quantity=1, per_unit=False, is_active=True)
    session.add(v)
    await session.commit()
    await session.refresh(v)
    session.add(VoucherProductLink(voucher_id=v.id, product_id=p1.id))
    await session.commit()

    session.add(ShippingConfig(base_fee_first_item=0.0, additional_fee_per_item=0.0, is_active=True))
    await session.commit()

    cart = Cart(user_id=user.id)
    session.add(cart)
    await session.commit()
    await session.refresh(cart)
    session.add(CartItem(cart_id=cart.id, product_id=p1.id, quantity=1))
    session.add(CartItem(cart_id=cart.id, product_id=p2.id, quantity=1))
    await session.commit()

    totals = await PricingService(session).compute_totals(user.id)
    # subtotal = 150, discount = 10% of 150 = 15
    assert round(totals["subtotal"], 2) == 150.0
    assert round(totals["discount"], 2) == 15.0
    assert round(totals["total"], 2) == 135.0


