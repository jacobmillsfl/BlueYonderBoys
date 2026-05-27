from app.seed import DEFAULT_BIO, DEFAULT_MOTTO


def test_get_bio_seeded(client):
    response = client.get("/api/bio")
    assert response.status_code == 200
    assert response.json()["content"] == DEFAULT_BIO


def test_update_bio_requires_auth(client):
    response = client.put("/api/bio", json={"content": "Updated bio text."})
    assert response.status_code == 401


def test_update_bio(client, admin_headers):
    response = client.put(
        "/api/bio",
        json={"content": "Updated bio text."},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["content"] == "Updated bio text."

    follow_up = client.get("/api/bio")
    assert follow_up.json()["content"] == "Updated bio text."


def test_get_motto_seeded(client):
    response = client.get("/api/motto")
    assert response.status_code == 200
    assert response.json()["content"] == DEFAULT_MOTTO


def test_update_motto_requires_auth(client):
    response = client.put("/api/motto", json={"content": "New motto."})
    assert response.status_code == 401


def test_update_motto(client, admin_headers):
    response = client.put(
        "/api/motto",
        json={"content": "New motto for the band."},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["content"] == "New motto for the band."

    follow_up = client.get("/api/motto")
    assert follow_up.json()["content"] == "New motto for the band."
