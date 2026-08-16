from auth import hash_password, verify_password


def test_bcrypt_hash_round_trip() -> None:
    password = "Strong-Example-29!"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$2")
    assert verify_password(password, hashed) is True
    assert verify_password("Wrong-Example-29!", hashed) is False


def test_invalid_hash_fails_closed() -> None:
    assert verify_password("Strong-Example-29!", "not-a-bcrypt-hash") is False
