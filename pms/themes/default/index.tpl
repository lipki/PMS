<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="utf-8"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />

	<title><?php echo $head_title; ?></title>
	<meta name="description" content="<?php echo $head_description; ?>"/>
	<meta name="author" content="<?php echo $head_author; ?>"/>
	
	<?php
	foreach($jsAndCss as $i) switch( $i['type'] ) {
	case 'js' : echo '<script>'.$i['value'].'</script>'; break;
	case 'jslink' : echo '<script src="'.$i['value'].'"></script>'; break;
	case 'css' : echo '<style>'.$i['value'].'</style>'; break;
	case 'csslink' : echo '<link rel="stylesheet" type="text/css" href="'.$i['value'].'" media="all" />'; break;
	}
	?>
	
</head>
<body>
	<div id="main">
		<header>
			<h1 id="title" class="stop"><?php echo $title; ?></h1>
		</header>
		<nav>
			<?php echo $nav; ?>
		</nav>
		<section id="container">
			<?php echo $content; ?>
		</section>
		<footer id="footer" class="stop">
			<?php echo $footer; ?>
		</footer>
	</div>
	<div id="update"><span>Update</span></div>
</body>
</html>
