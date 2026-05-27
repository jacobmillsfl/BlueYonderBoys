from pydantic import BaseModel, Field, model_validator


class BioOut(BaseModel):
    content: str

    class Config:
        from_attributes = True


class BioUpdate(BaseModel):
    content: str = Field(min_length=1)


class MottoOut(BaseModel):
    content: str

    class Config:
        from_attributes = True


class MottoUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=500)


class ShowOut(BaseModel):
    id: int
    date: str
    time: str
    venue: str
    address: str
    is_active: int

    class Config:
        from_attributes = True


class ShowCreate(BaseModel):
    date: str
    time: str = ""
    venue: str
    address: str = ""
    location: str | None = None  # legacy alias (older API builds)
    is_active: int = 1

    @model_validator(mode="before")
    @classmethod
    def normalize_address(cls, data):
        if isinstance(data, dict):
            merged = dict(data)
            if not merged.get("address") and merged.get("location"):
                merged["address"] = merged["location"]
            return merged
        return data

    @model_validator(mode="after")
    def address_required(self):
        if not self.address.strip():
            raise ValueError("address is required")
        return self


class ShowUpdate(BaseModel):
    date: str | None = None
    time: str | None = None
    venue: str | None = None
    address: str | None = None
    location: str | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_address(cls, data):
        if isinstance(data, dict):
            merged = dict(data)
            if merged.get("address") is None and merged.get("location") is not None:
                merged["address"] = merged["location"]
            return merged
        return data


class LinkOut(BaseModel):
    id: int
    label: str
    url: str
    icon: str | None
    sort_order: int

    class Config:
        from_attributes = True


class LinkUpdate(BaseModel):
    url: str = Field(min_length=1)
    icon: str | None = None
    sort_order: int | None = None


class LinkUpdateItem(BaseModel):
    id: int
    url: str = Field(min_length=1)


class LinksBulkUpdate(BaseModel):
    links: list[LinkUpdateItem]


class PhotoOut(BaseModel):
    id: int
    url: str
    caption: str | None
    sort_order: int


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
