
from app.database.db import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

class HeroSlider(Base):
    __tablename__ = "herosliders"

    id:Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    img:Mapped[str] = mapped_column(String(255), nullable=False)
    is_active:Mapped[bool] = mapped_column(default=True)