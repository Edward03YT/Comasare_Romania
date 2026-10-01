-- Creare tabel judet_geom prin ST_Union (dissolve) din UAT-urile existente
create table if not exists judet_geom as
select
  judet,
  st_multi(st_union(geom)) as geom,
  st_centroid(st_union(geom)) as centroid
from uat
where geom is not null
group by judet;

-- Index spatial pe geometria de judet
create index if not exists idx_judet_geom_geom on judet_geom using gist(geom);
