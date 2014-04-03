###
# 切割 Array Like 片段
#
# @private
# @method   slicer
# @return
###
slicer = ( args, index ) ->
  return [].slice.call args, (Number(index) || 0)
