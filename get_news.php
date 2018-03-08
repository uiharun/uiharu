<?php
header("Content-Type: text/javascript; charset=utf-8");
ini_set('allow_url_fopen'  , 1);
ini_set('allow_url_include', 1);

//phpinfo();
// php 5.3.3
define( "NEWS_MAX_VAL", 12 );
define( "CUT_LENGTH"  , 80 );

// json 読み込み
$json = file_get_contents('../data/news.json');
//$json = file_get_contents('../test/r11i8i000000m6d3.json');
//$json = file_get_contents('./r11i8i000000bnam.json');
//$json = file_get_contents('./copy_test.json');
//$json = mb_convert_encoding($json, 'UTF8', 'ASCII,JIS,UTF-8,EUC-JP,SJIS-WIN');
//$json = mb_convert_encoding($json,"sjis","utf-8");
//$json = mb_convert_encoding($json,"utf-8","sjis");
//$json = mb_convert_encoding($json, "sjis", "ASCII");

//var_dump($json);

// tab が入っていると json_decode で失敗するので除去する 改行も
$json = str_replace("\t"  , "", $json);
$json = str_replace("\r\n", "", $json);
$json = str_replace("\n"  , "", $json);

$decoded_json = json_decode( $json, true );
//echo json_last_error();
//echo json_last_error_msg();

//var_dump($decoded_json);

// 絞り込みパラメータ
$year     = ( isset($_GET["year"]    ) ? $_GET["year"]     : "" ); // 年度
$source   = ( isset($_GET["source"]  ) ? $_GET["source"]   : "" ); // 発信元
$contents = ( isset($_GET["contents"]) ? $_GET["contents"] : "" ); // 内容

$offset   = intval( isset($_GET["offset"]  ) ? $_GET["offset"]  : "0" );
$max_val  = intval( isset($_GET["max_val"] ) ? $_GET["max_val"] : NEWS_MAX_VAL );

//$year     = "2017";
//$source   = "学園";
//$contents = "お知らせ";
//$offset   = 10;
//$max_val  = 1;

$match_data = array();

foreach( $decoded_json["records"] as $year_data ){
  $keys = array_keys( $year_data );
  $key_name = $keys[0];

  // 年度の指定がないか一致する
  if( empty( $year ) || ( $key_name == $year ) ){
    $news_list = $year_data[$key_name];

    foreach( $news_list as $data ){
      $keys   = array_keys($data);
      $detail = $data[$keys[0]][0];

//      $source_match   = empty( $source   ) || ( strpos( $detail["source"],   $source   ) !== false );
//      $contents_match = empty( $contents ) || ( strpos( $detail["contents"], $contents ) !== false );

      $source_match   = search_match( $detail["source"]  , $source   );
      $contents_match = search_match( $detail["contents"], $contents );

      if( $source_match && $contents_match ){

        // 長すぎる文章を 80 文字で切り取り
        if( CUT_LENGTH < mb_strlen( $detail["text"] )){
          $detail["text"] = mb_substr( $detail["text"], 0, CUT_LENGTH, 'utf-8' ) ."…";
        }

        // 画像の登録がない場合のデフォルト
        if       ( !isset( $detail["img"] )){
          $detail["img"] = "/common/img/info/info-01.png";
        } else if( empty( $detail["img"] )){
          $detail["img"] = "/common/img/info/info-01.png";
        }

        array_push( $match_data, $detail );
      }
    }
  }
}

$record_data = array_slice( $match_data, $offset, $max_val );
$result_data = array("records"=>$record_data, "next"=>( count( $record_data ) < ( count( $match_data ) - $offset )) );
//var_dump($result_data);

// records = 該当レコード
// next    = さらに取得可能 true:可 false:不可
echo json_encode( $result_data );

exit();

function search_match( $check_str, $match_str )
{ 
  $res = true;
  if( !empty( $match_str ) ){
    foreach( split(",", $check_str ) as $val ){
      if( $res = ( $val === $match_str ) ){
        break;
       }
    }
  }
  return $res;
}
?>