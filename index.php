<?php

define('DS', DIRECTORY_SEPARATOR);
define('ROOT_DIR', '.'.DS.'pms'.DS);
define('ARTICLE_DIR', ROOT_DIR.'articles'.DS);
define('ROOT_R_URI', './pms/');
define('LIB_R_URI', ROOT_R_URI.'libs/');
define('THEME_R_URI', ROOT_R_URI.'themes/default/');

if( $_SERVER['QUERY_STRING'] == 'a') $admin = true;

// loaded content
$xml = simplexml_load_file(ROOT_DIR.'articles.xml');

$save = false;



// article
if ( $_SERVER['QUERY_STRING'] == 's' ) {

    $content = stripslashes($_POST['content']);
    $content = str_replace(' target= GENTICS_link_text" _self"="', '', $content);
    $content = str_replace(' class="GENTICS_ephemera"', '/', $content);
    $content = str_replace(' contenteditable="true"', '', $content);
    $content = preg_replace('/GENTICS_[^"]*/', '', $content);
    $content = preg_replace('/class=" *"/', '', $content);
    $content = preg_replace('/ id="GENTICS_Table_[^"]*"/', '', $content);
    
    switch( $_POST['id'] ) {
	case 'title'  : $xml->title  = trim($content); break;
	case 'footer' : $xml->footer = trim($content); break;
	default :
		
		$nbt = intval(implode('', explode('titlearticle', $_POST['id'])));
		$nbs = intval(implode('', explode('article', $_POST['id'])));
		if( $nbt != 0 ) 
			$xml->articles->article[$nbt-1]->title = trim($content);
		else	$xml->articles->article[$nbs-1]->section = trim($content);
    }
    $save = true;
}

// plus
if ( $_SERVER['QUERY_STRING'] == 'p' ) {
    $article = $xml->articles->addChild('article');
    $article->addChild('lvl', '0');
    $article->addChild('title', $_POST['title']);
    $article->addChild('section', $_POST['content']);
    $save = true;
}

// Hierarchy
if ( $_SERVER['QUERY_STRING'] == 'h' ) {
    $nb = intval(implode('', explode('article', $_POST['id'])));
    $xml->articles->article[$nb-1]->lvl = $_POST['lvl'];
    $save = true;
}






// Ordre
if ( $_SERVER['QUERY_STRING'] == 'o' ) {
    $ordre = $_POST['ordre'];
    foreach($ordre as $key => $val)
		$ordre[$key] = clone $xml->articles->article[$val-1];
	while (count($xml->articles[0]->children()))
		unset($xml->articles->article[0]);
    foreach($ordre as $key => $val) {
		$article = $xml->articles->addChild('article');
		$article->addChild('lvl', $ordre[$key]->lvl);
		$article->addChild('title', $ordre[$key]->title);
		$article->addChild('section', $ordre[$key]->section);
	}
    $save = true;
}

// delete
if ( $_SERVER['QUERY_STRING'] == 'd' ) {
    $nb = intval(implode('', explode('article', $_POST['id'])));
    unset($xml->articles->article[$nb-1]);
    $save = true;
}

//save
if ( $save ) {
    if (!$fp = fopen(ROOT_DIR.'articles.xml',"w+"))
        exit('Echec lors de l\'ouverture du fichier '.ROOT_DIR.'articles.xml');
    fputs($fp, $xml->asXML());
    fclose($fp);
    exit ('ok');
}

// construct content
$title = $xml->title;
$footer = $xml->footer;
$xmlcontent = $xml->articles->article;
$nav = simplexml_load_string('<nav><menu id="accordion"/></nav>');
$i = 0;
foreach ($xmlcontent as $key => $val) {
	$i ++;
	
	$content .= '<article id="article'.$i.'" class="stop">';
	$content .= '<h2>'.$val->title.'</h2>';
	$content .= '<section>'.$val->section.'</section>';
	$content .= '</article>';
	$content .= '<a class="top" href="#accordion"><span>menu</span></a>';
	
	$li 	  = $nav->menu->addChild('li');
	$a 	  = $li->addChild('a');
	$span 	  = $a->addChild('span', $val->title);
	
	$li->addAttribute('class', 'lvl'.$val->lvl);
	$a->addAttribute('href', '#article'.$i);
}
$nav = $nav->menu->asXML();

// in head
if( $admin ) {

    // head title
    $head_title = $title." -- ADMIN";

    // js and css
    $jsAndCss = array(
            array('type' => 'csslink', 'value' => THEME_R_URI."css/style.css"),
            
            array('type' => 'js',     'value' => 'GENTICS_Aloha_base="'.LIB_R_URI.'aloha/";'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/aloha.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.Abbr/plugin.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.Format/plugin.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.HighlightEditables/plugin.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.Link/plugin.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.LinkChecker/plugin.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.List/plugin.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.Paste/plugin.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.Table/plugin.js'),
            array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/at.tapo.aloha.plugins.Image/plugin.js'),
            //array('type' => 'jslink', 'value' => LIB_R_URI.'aloha/plugins/com.gentics.aloha.plugins.TOC/plugin.js'),
            
            array('type' => 'jslink',  'value' => LIB_R_URI.'jquery/jquery-ui-1.8.15.custom.min.js'),
            array('type' => 'jslink',  'value' => LIB_R_URI.'jquery/ascript.js'),
            array('type' => 'jslink',  'value' => THEME_R_URI.'js/script.js')
        );
} else {

    // head title
    $head_title = $title;

    // js and css
    $jsAndCss = array(
            array('type' => 'csslink', 'value' => THEME_R_URI."css/style.css"),
            array('type' => 'jslink',  'value' => LIB_R_URI.'jquery/jquery-1.6.2.min.js'),
            array('type' => 'jslink',  'value' => LIB_R_URI.'jquery/jquery-ui-1.8.15.custom.min.js'),
            array('type' => 'jslink',  'value' => THEME_R_URI."js/script.js"),
            array('type' => 'js',      'value' => '$(document).ready(function() {$( "#accordion" ).accordion();});')
        );
}

// display
require(THEME_R_URI.'index.tpl');

