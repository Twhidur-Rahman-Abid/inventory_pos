from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import os

from app.database.db import get_db
from app.database.schema.branch import Branch
from app.models.branch import BranchResponse
from app.utils.utils import save_image 
from app.utils.dependencies import admin_required

branchRouter = APIRouter(prefix="/branches", tags=["Branches"], dependencies=[Depends(admin_required)])

# --- Create Branch ---
@branchRouter.post("/", response_model=BranchResponse, status_code=201)
async def create_branch(
    name: str = Form(...),
    location: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    img_path = None
    if image:
        img_path = await save_image(file=image, folder="branches", filename=name)

    new_branch = Branch(name=name, location=location, img=img_path)
    db.add(new_branch)
    await db.commit()
    await db.refresh(new_branch)
    return new_branch

# --- Get All Branches ---
@branchRouter.get("/", response_model=List[BranchResponse])
async def get_branches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Branch))
    return result.scalars().all()

# --- Get Single Branch ---
@branchRouter.get("/{branch_id}", response_model=BranchResponse)
async def get_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    branch = await db.get(Branch, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch

# --- Update Branch ---
@branchRouter.put("/{branch_id}", response_model=BranchResponse)
async def update_branch(
    branch_id: int,
    name: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    branch = await db.get(Branch, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    if name: branch.name = name
    if location: branch.location = location
    
    if image:
        branch.img = await save_image(file=image, folder="branches", filename=name or branch.name)

    await db.commit()
    await db.refresh(branch)
    return branch

# --- Delete Branch ---
@branchRouter.delete("/{branch_id}")
async def delete_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    branch = await db.get(Branch, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

  
    if branch.img and os.path.exists(branch.img):
        os.remove(branch.img)

    await db.delete(branch)
    await db.commit()
    return {"message": "Branch deleted successfully"}