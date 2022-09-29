from importlib.resources import path
import os, json
import pathlib

# cd to 'assets' directory
os.chdir('assets')
IMG_PATH = 'img'
ANIMATION_PATH = 'animation'
SOUND_PATH = 'sound'
FONT_PATH = 'font'


def get_img_list():
    filelist = list(pathlib.Path(IMG_PATH).iterdir())
    # for single image files
    imglist = []
    # for texture atlas file
    _jsonlist = []
    jsonlist = []
    # firstly find all the json files for texture atlas
    # the corresponding images should not be included in 'img'
    for filename in filelist:
        if filename.suffix == '.json':
            # only keep the name, without suffix
            _jsonlist.append(filename.stem)
            # complete path with suffix
            jsonlist.append(str(pathlib.PurePosixPath(filename)))
    # find all images, excluding texture atlas
    for filename in filelist:
        if filename.suffix == '.json':
            continue
        if filename.stem in _jsonlist:
            continue
        imglist.append(str(pathlib.PurePosixPath(filename)))
    return imglist, jsonlist


def get_animation_list():
    filelist = list(pathlib.Path(ANIMATION_PATH).iterdir())
    jsonlist = []
    for filename in filelist:
        if filename.suffix == '.json':
            jsonlist.append(str(pathlib.PurePosixPath(filename)))
    return jsonlist


if __name__ == '__main__':
    assets = {}
    assets['img'], assets['img_json'] = get_img_list()
    assets['anim_json'] = get_animation_list()
    with open('list.json', 'w') as f:
        json.dump(assets, f, indent=4)
