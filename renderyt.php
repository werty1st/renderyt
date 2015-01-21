<?php


/*
INSTALL

wget http://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar
sudo apt-get update
sudo apt-get install firefox
sudo apt-get install xvfb


DEBUG
apt-get install x11vnc
x11vnc -display :10



RUN
sudo Xvfb :10 -ac  -screen 0 1600x1200x24+32
sudo Xvfb :10 -ac  -screen 0 400x300x24+32
export DISPLAY=:10
java -jar selenium-server-standalone-2.44.0.jar > selenium.log 
nodejs renderyt.js




ubnutu upstartscript
--------------------
nohup java -jar selenium-server-standalone-2.44.0.jar -host 127.0.0.1 -port 4444 -log selenium.log > /dev/null
sudo iptables -A INPUT -p tcp --dport 4444 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 4444 -j DROP

apt-get install daemon

anleitung befolgen: https://github.com/feniix/selenium-grid-startup





phpunit renderyt.php
*/
require_once 'vendor/autoload.php';

class GitHubTests extends PHPUnit_Framework_TestCase {

    /**
     * @var \RemoteWebDriver
     */
    protected $webDriver;
    protected $url = "https://www.youtube.com/watch?v=0ha10zQym0s";

    public function setUp()
    {
        $host = 'http://localhost:4444/wd/hub'; // this is the default;
        
        $FirefoxProfile = new FirefoxProfile();
        $FirefoxProfile->setPreference("plugin.state.flash", 0);

        $desired_capabilities = DesiredCapabilities::firefox();
        $desired_capabilities->setCapability(FirefoxDriver::PROFILE, $FirefoxProfile);

        $this->webDriver = RemoteWebDriver::create($host, $desired_capabilities);
    }



    public function testGitHubHome()
    {

        $window = new WebDriverDimension(800, 600);
        $this->webDriver->manage()->window()->setSize($window);
        $this->webDriver->get($this->url);

        
        $wait = new WebDriverWait($this->webDriver, 10);
        $wait->until(WebDriverExpectedCondition::elementToBeClickable(WebDriverBy::className("videoAdUiSkipButton")));
        $this->webDriver->executeScript(
            'setTimeout(function(){document.getElementsByClassName("videoAdUiSkipButton")[0].click()},1000)'
            );

        //setTimeout(function(){document.getElementsByClassName("videoAdUiSkipButton")[0].click()},2000)
        

        $ele = $this->webDriver->findElement(WebDriverBy::id("movie_player"));
        $point = $ele->getLocation();

        $eleWidth = $ele->getSize()->getWidth();
        $eleHeight = $ele->getSize()->getHeight();



        sleep ( 3 ); //video muss werbung noch laden
        $this->webDriver->takeScreenshot("screen.png");

        $mainimage = imagecreatefrompng ( "screen.png" );
        $mainimage_x_size = getimagesize( "screen.png" )[0];
        $mainimage_y_size = getimagesize( "screen.png" )[1];

        $to_crop_array = array('x' => $point->getX(),
                               'y' => $point->getY(),
                               'width' => $eleWidth,
                               'height'=> $eleHeight
                               );
        $thumb_im = imagecrop($mainimage, $to_crop_array);

        imagejpeg($thumb_im, 'thumb.jpeg', 100);


        $this->assertContains('YouTube', $this->webDriver->getTitle());
        
        // close the Firefox
        $this->webDriver->quit();
    }   

}

