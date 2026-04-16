-- Migration: add missing indexes
-- Run in: Supabase Dashboard → SQL Editor

-- tools 表：rating 排序索引（所有列表页都按 rating DESC 排序）
create index if not exists tools_rating_idx on tools(rating desc);

-- tools 表：slug 已是 unique，Postgres 自动建了唯一索引，无需重复创建
-- 验证用：SELECT indexname FROM pg_indexes WHERE tablename='tools' AND indexname='tools_slug_key';

-- news 表：published_at 排序索引
create index if not exists news_published_at_idx on news(published_at desc);

-- news 表：category 过滤索引
create index if not exists news_category_idx on news(category);

-- news 表：slug 点查（如果没有 unique 约束则需要手动建）
create index if not exists news_slug_idx on news(slug);

-- 验证所有索引
select tablename, indexname, indexdef
from pg_indexes
where tablename in ('tools', 'news')
order by tablename, indexname;
