MONGO_CID = mongo.cid
NODE_CID = node.cid

initMongo: updateMongo
	docker run -dit -v $(CURDIR)/db:/data/db -v $(CURDIR)/configs:/configs -v $(CURDIR)/mongo:/mongo --cidfile=$(MONGO_CID) -p 27017:27017 mongo:latest
	sleep 1;
	docker exec -it $$(cat ./$(MONGO_CID)) mongo --eval 'load("/configs/configs.js"); load("/mongo/init.js");'
	make restartMongo

initNode: updateNode
	make retartNode

updateMongo:
	docker pull mongo

updateNode:
	docker pull node
	docker run -dit -v $(CURDIR)/node:/node --cidfile=$(NODE_CID) -w /node node:latest npm install --production

stopMongo:
	docker stop $$(cat ./$(MONGO_CID))
	docker rm $$(cat ./$(MONGO_CID))
	rm -rf $(MONGO_CID)

stopNode:
	docker stop $$(cat ./$(NODE_CID))
	docker rm $$(cat ./$(NODE_CID))
	rm -rf $(NODE_CID)

startMongo:
	docker run -dit -v $(CURDIR)/db:/data/db --cidfile=$(MONGO_CID) -p 27017:27017 mongo:latest --auth

startNode:
	docker run -dit -v $(CURDIR)/configs:/configs -v $(CURDIR)/node:/node --cidfile=$(NODE_CID) -p 3000:3000 -w /node --link $$(cat ./$(MONGO_CID)):mongo node:latest node ./apiMain/app.js

restartMongo: stopMongo startMongo 

restartNode: stopNode startNode

initAll: initMongo initNode

stopAll: stopMongo stopNode

startAll: startMongo startNode

restartAll: restartMongo restartNode

