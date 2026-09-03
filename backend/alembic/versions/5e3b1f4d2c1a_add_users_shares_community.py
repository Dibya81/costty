"""add users, share_links, community_requests, community_offers

Revision ID: 5e3b1f4d2c1a
Revises: 031f17ab4fc0
Create Date: 2026-09-03 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e3b1f4d2c1a'
down_revision: Union[str, None] = '031f17ab4fc0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    op.create_table(
        'share_links',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('slug', sa.String(length=32), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.String(length=128), nullable=False),
        sa.Column('permission', sa.String(length=16), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('view_count', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['file_id'], ['files.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )
    op.create_index(op.f('ix_share_links_id'), 'share_links', ['id'], unique=False)
    op.create_index(op.f('ix_share_links_slug'), 'share_links', ['slug'], unique=True)
    op.create_index(op.f('ix_share_links_file_id'), 'share_links', ['file_id'], unique=False)
    op.create_index(op.f('ix_share_links_owner_id'), 'share_links', ['owner_id'], unique=False)

    op.create_table(
        'community_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('tags', sa.String(length=512), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='open'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_community_requests_id'), 'community_requests', ['id'], unique=False)
    op.create_index(op.f('ix_community_requests_author_id'), 'community_requests', ['author_id'], unique=False)

    op.create_table(
        'community_offers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('request_id', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('note', sa.Text(), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['request_id'], ['community_requests.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_community_offers_id'), 'community_offers', ['id'], unique=False)
    op.create_index(op.f('ix_community_offers_request_id'), 'community_offers', ['request_id'], unique=False)
    op.create_index(op.f('ix_community_offers_author_id'), 'community_offers', ['author_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_community_offers_author_id'), table_name='community_offers')
    op.drop_index(op.f('ix_community_offers_request_id'), table_name='community_offers')
    op.drop_index(op.f('ix_community_offers_id'), table_name='community_offers')
    op.drop_table('community_offers')
    op.drop_index(op.f('ix_community_requests_author_id'), table_name='community_requests')
    op.drop_index(op.f('ix_community_requests_id'), table_name='community_requests')
    op.drop_table('community_requests')
    op.drop_index(op.f('ix_share_links_owner_id'), table_name='share_links')
    op.drop_index(op.f('ix_share_links_file_id'), table_name='share_links')
    op.drop_index(op.f('ix_share_links_slug'), table_name='share_links')
    op.drop_index(op.f('ix_share_links_id'), table_name='share_links')
    op.drop_table('share_links')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
