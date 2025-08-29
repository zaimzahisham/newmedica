import pytest
from httpx import AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models import User, Product, Voucher, UserType, VoucherProductLink
import tests.utils as tu

@pytest.mark.asyncio
async def test_get_product_vouchers_authenticated_user(async_client: AsyncClient, session: AsyncSession):
    # Setup: Create user types, user, product, and vouchers
    basic_type = await tu.create_test_user_type(session, name="Basic")
    agent_type = await tu.create_test_user_type(session, name="Agent")
    healthcare_type = await tu.create_test_user_type(session, name="Healthcare")

    # Create users and get their tokens
    register_res_basic = await tu.register_user(async_client, "basic@example.com", "password", "Basic")
    user_basic = register_res_basic.json()
    login_res_basic = await async_client.post("/api/v1/auth/login", data={"username": "basic@example.com", "password": "password"})
    token_basic = login_res_basic.json()["access_token"]

    register_res_agent = await tu.register_user(async_client, "agent@example.com", "password", "Agent")
    user_agent = register_res_agent.json()
    login_res_agent = await async_client.post("/api/v1/auth/login", data={"username": "agent@example.com", "password": "password"})
    token_agent = login_res_agent.json()["access_token"]

    register_res_healthcare = await tu.register_user(async_client, "healthcare@example.com", "password", "Healthcare")
    user_healthcare = register_res_healthcare.json()
    login_res_healthcare = await async_client.post("/api/v1/auth/login", data={"username": "healthcare@example.com", "password": "password"})
    token_healthcare = login_res_healthcare.json()["access_token"]

    product1 = await tu.create_test_product(session, name="Product 1", price=100.0)
    product2 = await tu.create_test_product(session, name="Product 2", price=50.0)

    # Vouchers
    # 1. Global voucher (should apply to any user/product)
    voucher_global = await tu.create_test_voucher(session, code="GLOBAL_10", discount_type="fixed", amount=10.0, scope="global")
    
    # 2. User-type specific voucher (for Agent)
    voucher_agent_type = await tu.create_test_voucher(session, code="AGENT_20", discount_type="percent", amount=20.0, scope="user_type", target_user_type_id=agent_type.id)
    
    # 3. Product-specific voucher (for Product 1)
    voucher_product1_fixed = await tu.create_test_voucher(session, code="P1_FIXED_5", discount_type="fixed", amount=5.0, scope="product_list")
    session.add(VoucherProductLink(voucher_id=voucher_product1_fixed.id, product_id=product1.id))

    # 4. Product-specific voucher (for Product 1, with min_quantity and per_unit)
    voucher_product1_per_unit = await tu.create_test_voucher(session, code="P1_PER_UNIT_2", discount_type="fixed", amount=2.0, scope="product_list", min_quantity=2, per_unit=True)
    session.add(VoucherProductLink(voucher_id=voucher_product1_per_unit.id, product_id=product1.id))

    # 5. Voucher for Product 2 (should not apply to Product 1)
    voucher_product2_fixed = await tu.create_test_voucher(session, code="P2_FIXED_10", discount_type="fixed", amount=10.0, scope="product_list")
    session.add(VoucherProductLink(voucher_id=voucher_product2_fixed.id, product_id=product2.id))

    await session.commit()

    # Test for user_agent and product1
    # Expected: GLOBAL_10, AGENT_20, P1_FIXED_5, P1_PER_UNIT_2
    response = await async_client.get(f"/api/v1/products/{product1.id}/vouchers", headers={"Authorization": f"Bearer {token_agent}"})
    
    assert response.status_code == 200
    vouchers_data = response.json()
    
    assert len(vouchers_data) == 4
    codes = {v["code"] for v in vouchers_data}
    assert "GLOBAL_10" in codes
    assert "AGENT_20" in codes
    assert "P1_FIXED_5" in codes
    assert "P1_PER_UNIT_2" in codes

    # Test for user_basic and product1
    # Expected: GLOBAL_10, P1_FIXED_5, P1_PER_UNIT_2
    response = await async_client.get(f"/api/v1/products/{product1.id}/vouchers", headers={"Authorization": f"Bearer {token_basic}"})
    
    assert response.status_code == 200
    vouchers_data = response.json()
    
    assert len(vouchers_data) == 3
    codes = {v["code"] for v in vouchers_data}
    assert "GLOBAL_10" in codes
    assert "AGENT_20" not in codes # Agent specific voucher
    assert "P1_FIXED_5" in codes
    assert "P1_PER_UNIT_2" in codes
    assert "P2_FIXED_10" not in codes # Product 2 specific voucher

    # Test for unauthenticated user
    response = await async_client.get(f"/api/v1/products/{product1.id}/vouchers")
    assert response.status_code == 401 # Or 200 with empty list, depending on desired behavior for public access
    # For now, assuming 401 as per typical authenticated endpoints. If public access is desired, this test needs adjustment.

    # Test for non-existent product
    non_existent_product_id = "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    response = await async_client.get(f"/api/v1/products/{non_existent_product_id}/vouchers", headers={"Authorization": f"Bearer {token_agent}"})
    assert response.status_code == 200
    vouchers_data = response.json()
    # For a non-existent product, only global and user-type specific vouchers should be returned
    # (assuming they are not tied to specific products)
    codes = {v["code"] for v in vouchers_data}
    assert "GLOBAL_10" in codes
    assert "AGENT_20" in codes # Agent specific voucher
    assert "P1_FIXED_5" not in codes # Product 1 specific voucher
    assert "P1_PER_UNIT_2" not in codes # Product 1 specific voucher
    assert "P2_FIXED_10" not in codes # Product 2 specific voucher
    assert len(vouchers_data) == 2 # GLOBAL_10 and AGENT_20

@pytest.mark.asyncio
async def test_user_type_voucher_with_product_link_filtering(async_client: AsyncClient, session: AsyncSession):
    # Setup: Create user types, user, products
    agent_type = await tu.create_test_user_type(session, name="Agent")
    register_res_agent = await tu.register_user(async_client, "agent_linked@example.com", "password", "Agent")
    login_res_agent = await async_client.post("/api/v1/auth/login", data={"username": "agent_linked@example.com", "password": "password"})
    token_agent = login_res_agent.json()["access_token"]

    product_linked = await tu.create_test_product(session, name="Linked Product", price=100.0)
    product_unlinked = await tu.create_test_product(session, name="Unlinked Product", price=50.0)

    # Create a user-type voucher that is also linked to a specific product
    voucher_agent_linked_product = await tu.create_test_voucher(
        session,
        code="AGENT_LINKED_TO_PRODUCT",
        discount_type="fixed",
        amount=15.0,
        scope="user_type",
        target_user_type_id=agent_type.id
    )
    session.add(VoucherProductLink(voucher_id=voucher_agent_linked_product.id, product_id=product_linked.id))
    await session.commit()

    # Test 1: Fetch vouchers for the LINKED product
    # Expected: AGENT_LINKED_TO_PRODUCT should be present
    response_linked = await async_client.get(
        f"/api/v1/products/{product_linked.id}/vouchers",
        headers={"Authorization": f"Bearer {token_agent}"}
    )
    assert response_linked.status_code == 200
    vouchers_data_linked = response_linked.json()
    codes_linked = {v["code"] for v in vouchers_data_linked}
    assert "AGENT_LINKED_TO_PRODUCT" in codes_linked, "Voucher should be present for the linked product"

    # Test 2: Fetch vouchers for an UNLINKED product
    # Expected: AGENT_LINKED_TO_PRODUCT should NOT be present
    response_unlinked = await async_client.get(
        f"/api/v1/products/{product_unlinked.id}/vouchers",
        headers={"Authorization": f"Bearer {token_agent}"}
    )
    assert response_unlinked.status_code == 200
    vouchers_data_unlinked = response_unlinked.json()
    codes_unlinked = {v["code"] for v in vouchers_data_unlinked}
    assert "AGENT_LINKED_TO_PRODUCT" not in codes_unlinked, "Voucher should NOT be present for an unlinked product"