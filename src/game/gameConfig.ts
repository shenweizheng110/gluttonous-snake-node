export default Object.freeze({
    snakeHeadSize: 20,
    snakeBodySize: 15,
    snakeEyeSize: 2,
    snakeEyeInterval: 5, // 蛇两个眼睛之间的距离
    beanSize: 20,
    snakeEnergy: 20, // 吃足 20能量值添加一个节点
    snakeItemInterval: 20, // 每个蛇节点之间的距离
    snakeHeadInterval: 25,
    dangerDistance: 100, // 危险警告的距离
    beanColor: ['#7F5032', '#CEC04F', '#A5251B', '#81C989', '#7B568B', '#0033FF', '#CC00CC', '#FFFF00', '#FF0099', '#00CC00'],
    canvasWidth: 1680,
    canvasHeight: 780
});

export const defaultSettings = {
    up: '87',
    down: '83',
    left: '65',
    right: '68',
    start: '32',
    exit: '27',
    speedUp: '75',
    showFight: '1',
    showPersonal: '1',
    initSpeed: '2',
    dangerColor: '#990000',
    nodeColor: '#336633;#336666;#336699;#CC6666;#CC0066;#99FF66;#006666;#3300CC;#3366CC;#33CCCC;#66CC99;#FF6666;#FF3366;#996666;#006666;#33FFCC;#FF3366;#FF3366;#CC9966',
    eyeColor: '#000000',
    initDirection: 'Top'
};
