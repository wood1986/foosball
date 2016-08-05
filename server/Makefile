MONGO_CID = mongo.cid
NODE_CID = node.cid

initMongo:
	docker pull mongo
	docker run -dit -v $(CURDIR)/db:/data/db -v $(CURDIR)/configs:/configs -v $(CURDIR)/mongo:/mongo --cidfile=$(MONGO_CID) -p 27017:27017 mongo:latest
	sleep 1;
	docker exec -it $$(cat ./$(MONGO_CID)) mongo --eval 'load("/configs/configs.js"); load("/mongo/init.js");'
	docker stop $$(cat ./$(MONGO_CID))
	docker rm $$(cat ./$(MONGO_CID))
	rm -rf $(MONGO_CID)
	docker run -dit -v $(CURDIR)/db:/data/db --cidfile=$(MONGO_CID) -p 27017:27017 mongo:latest --auth

initNode:
	docker pull node
	docker run -dit -v $(CURDIR)/configs:/configs -v $(CURDIR)/node:/node --cidfile=$(NODE_CID) -p 3000:3000 -w /node --link $$(cat ./$(MONGO_CID)):mongo node:latest /bin/bash -c "npm install --production && node ./api/app.js" 

cleanMongo:
	docker stop $$(cat ./$(MONGO_CID))
	docker rm $$(cat ./$(MONGO_CID))
	rm -rf $(MONGO_CID)
	rm -rf db
	mkdir db

cleanNode:
	docker stop $$(cat ./$(NODE_CID))
	docker rm $$(cat ./$(NODE_CID))
	rm -rf $(NODE_CID)