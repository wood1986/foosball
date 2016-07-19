MONGO_CID = mongo.cid
NODE_CID = node.cid

prdInitMongo:
	mkdir -p $(CURDIR)/db
	docker pull mongo
	docker run -dit -v $(CURDIR)/db:/data/db --cidfile=$(MONGO_CID) -p 27017:27017 mongo:latest
	docker cp mongo $$(cat ./$(MONGO_CID)):/
	docker cp configs.js $$(cat ./$(MONGO_CID)):/mongo
	sleep 1;
	docker exec -it $$(cat ./$(MONGO_CID)) mongo --eval 'load("/mongo/configs.js"); load("/mongo/init.js");'
	docker stop $$(cat ./$(MONGO_CID))
	docker rm $$(cat ./$(MONGO_CID))
	rm -rf $(MONGO_CID)
	docker run -dit -v $(CURDIR)/db:/data/db --cidfile=$(MONGO_CID) -p 27017:27017 mongo:latest --auth
	
prdInitNode:
	docker build -t foosball -f ./node/Dockerfile .
	docker run -dit --cidfile=$(NODE_CID) -p 3000:3000 --link $$(cat ./$(MONGO_CID)):mongo foosball

prdStartMongo:
	docker pull mongo
	docker run -dit -v $(CURDIR)/db:/data/db --cidfile=$(MONGO_CID) -p 27017:27017 mongo:latest --auth

prdStartNode: prdInitNode

prdStopMongo:
	docker stop $$(cat ./$(MONGO_CID))
	rm -rf $(MONGO_CID)

prdStopNode:
	docker stop $$(cat ./$(NODE_CID))
	rm -rf $(NODE_CID)

prdStopAll: prdStopMongo prdStopNode

prdStartAll: prdStartMongo prdStartNode

prdInitAll: prdInitMongo prdInitNode

devInitMongo:
	pkill mongod || true
	rm -rf $(CURDIR)/db $(CURDIR)/log
	mkdir $(CURDIR)/db $(CURDIR)/log
	mongod --fork --dbpath $(CURDIR)/db --logpath $(CURDIR)/log/mongod.log
	mongo --eval 'load("./configs.js"); load("./mongo/init.js");'

devInitNode:
	cd $(CURDIR)/node; \
	npm install

devInitAll: devInitMongo devInitNode