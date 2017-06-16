//
//  Graph.js
//  Graph Module for NodeJS
//
//  Created by Piergiuseppe Isonni <piergiuseppe.isonni@gmail.com>
//  for LOUD - Digital Agency <hello@loudsrl.com>.
//  Copyright © 2017 Piergiuseppe Isonni. All rights reserved.
//

"use strict";

	//BASIC CLASS AND STRUCTURES

	function Graph () {
		//add entity type of node
		this.nodes = [];
		this.Graph = {};
		this.Types = {};
	}

	function Node (type, value) {
		this.value = value;
		this.edges = [];
		this.type = type;
		this.relations = {};
		this.searched = false;
		this.parent = null;
	}

	function Edge (value, node) {
		this.value = value;
		this.node = node;
	}

	//DATA STRUCTURES METHODS

	Node.prototype.addEdge = function(neighbor, value, relation) {
		var sRelation = relation || "nul";
		var edgeNeighbor = new Edge(value, neighbor);
		var edgeParent = new Edge(value, this);
		this.edges.push(edgeNeighbor);
		this.relations[sRelation] = this.relations[sRelation] || [];
		this.relations[sRelation].push(edgeNeighbor);
		neighbor.edges.push(edgeParent);
		neighbor.relations[sRelation] = neighbor.relations[sRelation] || [];
		neighbor.relations[sRelation].push(edgeParent);
	}

	Graph.prototype.reset = function() {
		for (i = 0; i < this.nodes.length; i++) {
			this.nodes[i].searched = false;
			this.nodes[i].parent = null;
		}
	}

	Graph.prototype.addNode = function(n) {
		// Node into nodes array
		this.nodes.push(n);
		// Node into Graph "hash" table
		this.Graph[n.value] = n;
		this.Types[n.type] = this.Types[n.type] || {};
		this.Types[n.type][n.value] = n;
	}

	Graph.prototype.getNode = function(value, type) {
		//select node by value from "hash" table
		var sType = type || "";
		if (sType == "") {
			var n = this.Graph[value];
		} else {
			var n = this.Type[sType][value];
		}
		return n;
	}

	//Graph SEARCH METHODS

	Graph.prototype.bfs = function(startNode, endNode) {
		//initialize
		this.reset();
		var res = [];
		var q = [];
		//start
		startNode.searched = true;
		q.push(startNode);
		//main loop
		while (q.length > 0) {
			var current = q.shift();
			if (current == endNode) {
				console.log("Found " + current.value);
				break;
			}
			//add neighbors to queue
			for (i = 0; i < current.edges.length; i++) {
				var neighbor = current.edges[i].node;
				if (!neighbor.searched) {
					neighbor.searched = true;
					neighbor.parent = current;
					q.push(neighbor);
				}
			}
		}
		//path loop
		res.push(endNode);
		var next = endNode.parent;
		while (next != null) {
			res.push(next);
			next = next.parent;
		}
		//end
		return res;
	}

	Graph.prototype.similar = function(node, tollerance) {
		//initialize
		this.reset();
		res = [];
		//main loop
		for (i = 0; i < node.edges.length; i++) {
			if (node.edges[i].value > 0) {
				edgeMinValue = node.edges[i].value - tollerance;
				edgeMaxValue = node.edges[i].value + tollerance;
				edgeNode = node.edges[i].node;
				for (j = 0; j < edgeNode.edges.length; j++) {
					if ((edgeNode.edges[j].value > edgeMinValue && edgeNode.edges[j].value < edgeMaxValue) && edgeNode.edges[j].node != node) {
						console.log("found similar for "+edgeNode.value);
						console.log(edgeNode.edges[j].node);
						res.push(edgeNode.edges[j].node);
					}
				}
			}
		}
		//end
		return res;
	}

module.exports.Graph = Graph;
module.exports.Node = Node;
module.exports.Edge = Edge;
