# Subscriptions Talk for Desert GraphQL Meetup

## Dependencies

* Docker
* Node 10
* Yarn

## Getting Started

Open up a terminal and navigate to the root directory. Once there, run `./bootstrap.sh` from the command line. Running `bootstrap.sh` should take care of most of the setup; `bootstrap.sh` runs `yarn` and `yarn build` for each of the dependent projects.

```bash
./bootstrap.sh
docker-compose up
```

---

### Note: Following is for first time only, otherwise skip to next step

From root directory:

```bash
cd graphql
docker-compose up -d graphql prisma mysql # <-- ensure these are running in "UP" state first
docker-compose exec graphql sh
```

Once you get the prompt `$ /service #`, run:

```bash
yarn prisma deploy && yarn prisma generate
exit
```

Finally, run in /graphql directory:

```bash
yarn build && docker-compose restart graphql
```

---

Open <http://localhost:3000> in your favorite browser.

GraphQL Playground: <http://localhost:4000/graphql>
