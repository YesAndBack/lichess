"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2026-01-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('lichess_id', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('patron', sa.Boolean(), default=False),
        sa.Column('created_at_lichess', sa.DateTime(), nullable=True),
        sa.Column('seen_at', sa.DateTime(), nullable=True),
        sa.Column('play_time_total', sa.Integer(), default=0),
        sa.Column('play_time_tv', sa.Integer(), default=0),
        sa.Column('ratings', sa.JSON(), default=dict),
        sa.Column('profile', sa.JSON(), default=dict),
        sa.Column('access_token', sa.String(), nullable=True),
        sa.Column('refresh_token', sa.String(), nullable=True),
        sa.Column('token_expires_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('last_games_sync', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('lichess_id'),
        sa.UniqueConstraint('username'),
    )
    op.create_index('ix_users_lichess_id', 'users', ['lichess_id'])
    op.create_index('ix_users_username', 'users', ['username'])

    # Create games table
    op.create_table(
        'games',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('rated', sa.Boolean(), default=True),
        sa.Column('variant', sa.String(), default='standard'),
        sa.Column('speed', sa.String(), nullable=False),
        sa.Column('perf_type', sa.String(), nullable=False),
        sa.Column('time_control_initial', sa.Integer(), nullable=True),
        sa.Column('time_control_increment', sa.Integer(), nullable=True),
        sa.Column('white_username', sa.String(), nullable=False),
        sa.Column('white_rating', sa.Integer(), nullable=True),
        sa.Column('white_rating_diff', sa.Integer(), nullable=True),
        sa.Column('black_username', sa.String(), nullable=False),
        sa.Column('black_rating', sa.Integer(), nullable=True),
        sa.Column('black_rating_diff', sa.Integer(), nullable=True),
        sa.Column('user_color', sa.String(), nullable=False),
        sa.Column('result', sa.Enum('WIN', 'LOSS', 'DRAW', name='gameresult'), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('winner', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('last_move_at', sa.DateTime(), nullable=True),
        sa.Column('opening_eco', sa.String(), nullable=True),
        sa.Column('opening_name', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_games_user_id', 'games', ['user_id'])


def downgrade() -> None:
    op.drop_table('games')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS gameresult')
