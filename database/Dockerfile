FROM mysql:8.0.33

EXPOSE 3306

COPY ./script.sql /docker-entrypoint-initdb.d/

# asignar contraseña en producción y preproducción
ENV MYSQL_ALLOW_EMPTY_PASSWORD=yes
ENV MYSQL_DATABASE=db_cafeteria
ENV MYSQL_ROOT_PASSWORD=