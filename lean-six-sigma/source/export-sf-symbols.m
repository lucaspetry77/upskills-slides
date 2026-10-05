#import <AppKit/AppKit.h>
int main(int argc, char **argv) { @autoreleasepool {
NSArray *names=@[@"person.3.sequence",@"arrow.triangle.2.circlepath",@"point.3.connected.trianglepath.dotted",@"trash",@"magnifyingglass",@"chart.bar.xaxis",@"ruler",@"gauge.with.dots.needle.67percent",@"flask",@"slider.horizontal.3"];
for(NSString *name in names){
NSImage *symbol=[[NSImage imageWithSystemSymbolName:name accessibilityDescription:nil] imageWithSymbolConfiguration:[NSImageSymbolConfiguration configurationWithPointSize:160 weight:NSFontWeightRegular]];
if(!symbol){NSLog(@"Missing %@",name);return 1;}
NSBitmapImageRep *rep=[[NSBitmapImageRep alloc] initWithBitmapDataPlanes:NULL pixelsWide:256 pixelsHigh:256 bitsPerSample:8 samplesPerPixel:4 hasAlpha:YES isPlanar:NO colorSpaceName:NSDeviceRGBColorSpace bytesPerRow:0 bitsPerPixel:0];
[NSGraphicsContext saveGraphicsState];[NSGraphicsContext setCurrentContext:[NSGraphicsContext graphicsContextWithBitmapImageRep:rep]];
CGFloat scale=MIN(224/symbol.size.width,224/symbol.size.height);NSSize size=NSMakeSize(symbol.size.width*scale,symbol.size.height*scale);
[symbol drawInRect:NSMakeRect((256-size.width)/2,(256-size.height)/2,size.width,size.height)];[NSGraphicsContext restoreGraphicsState];
NSString *path=[[NSString stringWithUTF8String:argv[1]] stringByAppendingPathComponent:[name stringByAppendingString:@".png"]];[[rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}] writeToFile:path atomically:YES];printf("%s\n",name.UTF8String);
} }return 0;}
