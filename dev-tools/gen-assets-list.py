import os, json
import pathlib
from fontTools import ttLib


# cd to 'assets-dev' directory
os.chdir(pathlib.Path(__file__).parents[2] / 'assets-dev')
ASSETS_PATH = pathlib.Path('.')

IMG_PATH = ASSETS_PATH / 'img'
ANIMATION_PATH = ASSETS_PATH / 'animation'
SPINE_PATH = ASSETS_PATH / 'spine'
SOUND_PATH = ASSETS_PATH / 'sound'
FONT_PATH = ASSETS_PATH / 'font'
STYLE_PATH = ASSETS_PATH / 'style'
LANG_PATH = ASSETS_PATH / 'lang'


def get_img_list():
    filelist = list(IMG_PATH.iterdir()) if IMG_PATH.exists() else []
    # for single image files
    imglist = []
    # for texture atlas file
    _jsonlist = []
    jsonlist = []
    # firstly find all the json files for texture atlas
    # the corresponding images should not be included in 'img'
    for filepath in filelist:
        if filepath.suffix == '.json':
            # only keep the name, without suffix
            _jsonlist.append(filepath.stem)
            # complete path with suffix
            jsonlist.append(str(pathlib.PurePosixPath(filepath)))
    # find all images, excluding texture atlas
    for filepath in filelist:
        if filepath.suffix == '.json':
            continue
        if filepath.stem in _jsonlist:
            continue
        imglist.append(str(pathlib.PurePosixPath(filepath)))
    return imglist, jsonlist


def get_animation_list():
    filelist = list(ANIMATION_PATH.iterdir()) if ANIMATION_PATH.exists() else []
    jsonlist = []
    for filepath in filelist:
        if filepath.suffix == '.json':
            jsonlist.append(str(pathlib.PurePosixPath(filepath)))
    return jsonlist

def get_style_list():
    filelist = list(STYLE_PATH.iterdir()) if STYLE_PATH.exists() else []
    jsonlist = []
    for filepath in filelist:
        jsonlist.append(str(pathlib.PurePosixPath(filepath)))
    return jsonlist

def get_sound_list():
    filelist = list(SOUND_PATH.iterdir()) if SOUND_PATH.exists() else []
    soundlist = []
    for filepath in filelist:
        soundlist.append(str(pathlib.PurePosixPath(filepath)))
    return soundlist    

def get_lang_list():
    langlist = {}
    # get game.json in subdirectories
    filelist = list(LANG_PATH.rglob('game.json')) if LANG_PATH.exists() else []
    for filepath in filelist:
        # the subdirectory name is the locale code name
        code = filepath.parts[1]
        langlist[code] = str(pathlib.PurePosixPath(filepath))
    return langlist

def get_font_list():
    filelist = list(FONT_PATH.iterdir()) if FONT_PATH.exists() else []
    fontlist = []
    for filepath in filelist:
        filename = str(pathlib.PurePosixPath(filepath))
        # get both fontfamily and file path
        font = ttLib.TTFont(filename)
        fontFamily = font['name'].getDebugName(1)
        fontlist.append((fontFamily, filename))
    return fontlist

def get_spine_list():
    filelist = list(SPINE_PATH.iterdir()) if SPINE_PATH.exists() else []
    spinelist = []
    for filepath in filelist:
        if filepath.is_file(): continue
        # find json in subdirectories
        subfilelist = list(filepath.iterdir())
        for filepath2 in subfilelist:
            if filepath2.suffix == '.json':
                spinelist.append(str(pathlib.PurePosixPath(filepath2)))
    return spinelist


if __name__ == '__main__':
    assets = {}
    assets['img'], assets['img_atlas'] = get_img_list()
    assets['anim_atlas'] = get_animation_list()
    assets['spine_json'] = get_spine_list()
    assets['style'] = get_style_list()
    assets['sound'] = get_sound_list()
    assets['font'] = get_font_list()
    assets['lang'] = get_lang_list()
    with open('assets-list.json', 'w') as f:
        json.dump(assets, f, indent=2)
