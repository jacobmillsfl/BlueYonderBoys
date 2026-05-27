def test_create_and_list_show(client, admin_headers):
    create = client.post(
        "/api/shows",
        json={
            "date": "2026-06-15",
            "time": "7:00 PM",
            "venue": "The Armory",
            "address": "123 Main St, Fort Collins, CO",
        },
        headers=admin_headers,
    )
    assert create.status_code == 200
    show_id = create.json()["id"]

    listing = client.get("/api/shows")
    assert listing.status_code == 200
    shows = listing.json()
    assert any(s["id"] == show_id and s["venue"] == "The Armory" for s in shows)

    delete = client.delete(f"/api/shows/{show_id}", headers=admin_headers)
    assert delete.status_code == 200
    assert delete.json() == {"ok": True}
