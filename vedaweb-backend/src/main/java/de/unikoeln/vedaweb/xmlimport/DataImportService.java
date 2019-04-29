package de.unikoeln.vedaweb.xmlimport;
import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.unikoeln.vedaweb.document.Stanza;
import de.unikoeln.vedaweb.document.StanzaRepository;
import de.unikoeln.vedaweb.document.StanzaXmlRepository;
import de.unikoeln.vedaweb.util.Timer;
import net.sf.saxon.s9api.SaxonApiException;

@Service
public class DataImportService {
	
	private final Logger log = LoggerFactory.getLogger(this.getClass());
	public static final String LOCAL_XML_DIR = "tei";
	
	
	@Autowired
	private StanzaRepository stanzaRepo;
	
	@Autowired
	private StanzaXmlRepository stanzaXmlRepo;
	

	/*
	 * main method for testing import routine in dry run mode
	 */
	public static void main(String[] args) throws SaxonApiException, IOException {
		DataImportService trans = new DataImportService();
		trans.importXMLData(LOCAL_XML_DIR, true);
	}
	
	
	public int importXMLData(String xmlDirPath, boolean dryRun){
		List<Stanza> stanzas = new ArrayList<Stanza>();
		
		//check import directory path
		log.info((dryRun ? "(DRY RUN) " : "") + "Looking for XML files to import");
		File dir = new File(xmlDirPath);
		if (!dir.exists()) {
			log.error((dryRun ? "(DRY RUN) " : "") + "\"" + xmlDirPath + "\" could not be found.");
			return -1;
		} else if (!dir.isDirectory()) {
			log.error((dryRun ? "(DRY RUN) " : "") + "\"" + xmlDirPath + "\" is not a directory.");
			return -1;
		}
		
		//collect input files
		File[] files = dir.listFiles(getFileFilter());
		Arrays.sort(files);
		
		//init timer
		Timer timer = new Timer();
		
		//import raw stanza xml data for export
		log.info((dryRun ? "(DRY RUN) " : "") + "Starting raw XML data import from XML files");
		if (!dryRun) stanzaXmlRepo.deleteAll();
		for (File xmlFile : files) {
			timer.start();
			try {
				XmlDataImport.readRawStanzaXml(xmlFile, stanzaXmlRepo, dryRun);
			} catch (SaxonApiException e) {
				log.error((dryRun ? "(DRY RUN) " : "") + "Could not read XML data. Malformed?");
				e.printStackTrace();
				return -1;
			}
			log.info((dryRun ? "(DRY RUN) " : "") + "Finished reading raw data from \"" 
					+ xmlFile.getName() + "\" in " + timer.stop("s", true) + " seconds");
		}
		
		//start importing stanza object data
		log.info((dryRun ? "(DRY RUN) " : "") + "Starting data import from XML");
		for (File xmlFile : files) {
			timer.start();
			try {
				XmlDataImport.collectStanzasFromXML(xmlFile, stanzas);
			} catch (SaxonApiException e) {
				log.error((dryRun ? "(DRY RUN) " : "") + "Could not read XML data. Malformed?");
				e.printStackTrace();
				return -1;
			}
			log.info((dryRun ? "(DRY RUN) " : "") + "Finished reading \"" 
					+ xmlFile.getName() + "\" in " + timer.stop("s", true) + " seconds");
		}
		
		//sort and apply indices
		log.info((dryRun ? "(DRY RUN) " : "") + "Sorting documents, applying global indices");
		Collections.sort(stanzas);
		for (int i = 0; i < stanzas.size(); i++) {
			stanzas.get(i).setIndex(i);
		}
		
		//log read stanzas count
		if (stanzas.size() > 0)
			log.info((dryRun ? "(DRY RUN) " : "") + "Read " + stanzas.size() + " stanzas from XML");
		else
			log.warn((dryRun ? "(DRY RUN) " : "") + "Zero (in numbers: 0) stanzas read from XML!");
		
		//dry run?
		if (dryRun) return stanzas.size();
		
		//write to DB
		if (stanzas != null && !stanzas.isEmpty()){
			log.info("Deleting old DB documents");
			stanzaRepo.deleteAll();
			log.info("Importing new data into DB");
			stanzaRepo.insert(stanzas);
		} else {
			log.error("Data import failed. nothing read from XML?");
		}
		
		log.info("Data import finished.");
		return stanzas.size();
	}
	
	
	private FilenameFilter getFileFilter() {
		return new FilenameFilter() {
		    public boolean accept(File dir, String name) {
		        return name.toLowerCase().endsWith(".xml");
		    }
		};
	}
	
}
