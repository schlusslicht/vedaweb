package de.unikoeln.vedaweb.controllers;

import org.elasticsearch.action.search.SearchResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.unikoeln.vedaweb.search.SearchData;
import de.unikoeln.vedaweb.services.ElasticSearchService;



@RestController
@RequestMapping("api")
public class SearchController {
	
	@Autowired
	private ElasticSearchService search;
	
	
	@PostMapping(value = "/search", produces = {"application/json"})
    public String searchView(@RequestBody SearchData searchData) {
		SearchResponse response = search.search(searchData);
		if (response == null)
			return "{status: 'error'}";
		else
			return response.toString();
    }
	
}
