from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import os

from app.database.db import get_db
from app.database.schema.branch import Branch
from app.models.branch import BranchResponse
from app.utils.utils import delete_image_from_url, save_image 
from app.utils.dependencies import admin_required
from fastapi.responses import JSONResponse

branchRouter = APIRouter(prefix="/branches", tags=["Branches"])
# --- Create Branch ---
@branchRouter.post("/", response_model=BranchResponse,dependencies=[Depends(admin_required)], status_code=201)
async def create_branch(
    name: str = Form(...),
    location: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        img_path = None
        if image:
            img_path = await save_image(file=image, folder="branches", filename=name)

        new_branch = Branch(name=name, location=location, img=img_path)
        db.add(new_branch)
        await db.commit()
        await db.refresh(new_branch)
        return new_branch

    except Exception as e:
        await db.rollback()
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred while creating branch!"}
        )


# --- Get All Branches ---
@branchRouter.get("/", response_model=List[BranchResponse])
async def get_branches(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Branch))
        return result.scalars().all()
        
    except Exception as e:
      
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred while fetching branches!"}
        )


# --- Get Single Branch ---
@branchRouter.get("/{branch_id}", response_model=BranchResponse)
async def get_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    try:
        branch = await db.get(Branch, branch_id)
        if not branch:
            return JSONResponse(
                status_code=404,
                content={"message": f"Branch with id {branch_id} not found"}
            )
        return branch
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )


# --- Update Branch ---
@branchRouter.put("/{branch_id}",dependencies=[Depends(admin_required)], response_model=BranchResponse)
async def update_branch(
    branch_id: int,
    name: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        branch = await db.get(Branch, branch_id)
        if not branch:
            return JSONResponse(
                status_code=404,
                content={"message": f"Branch with id {branch_id} not found"}
            )

        if name: 
            branch.name = name
        if location: 
            branch.location = location
        
    
        if image:
            if  branch.img:
                delete_image_from_url(branch.img) 
                
            branch.img = await save_image(file=image, folder="branches", filename=name or branch.name)

        await db.commit()
        await db.refresh(branch)
        return branch

    except Exception as e:
        await db.rollback()
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred while updating branch!"}
        )


# --- Delete Branch ---
@branchRouter.delete("/{branch_id}",dependencies=[Depends(admin_required)], status_code=204) 
async def delete_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    try:
        branch = await db.get(Branch, branch_id)
        if not branch:
            return JSONResponse(
                status_code=404,
                content={"message": f"Branch with id {branch_id} not found"}
            )

        
        if  branch.img:
            delete_image_from_url(branch.img)

        
        await db.delete(branch)
        await db.commit()
        
        return None 

    except Exception as e:
        await db.rollback()
        
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred while deleting branch!"}
        )