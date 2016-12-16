package org.hisp.appstore.web.api;

import com.sun.org.apache.regexp.internal.RE;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hisp.appstore.api.AppStoreService;
import org.hisp.appstore.api.RenderService;
import org.hisp.appstore.api.ReviewService;
import org.hisp.appstore.api.UserService;
import org.hisp.appstore.api.domain.*;
import org.hisp.appstore.util.WebMessageUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping ( value = "/apps" )
public class AppController extends AbstractCrudController<App>
{
    private static final Log log = LogFactory.getLog( AppController.class );

    private static final String NOT_FOUND = "No App found with id: ";

    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------

    @Autowired
    private AppStoreService appStoreService;

    @Autowired
    private UserService userService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private RenderService renderService;

    // -------------------------------------------------------------------------
    // GET
    // -------------------------------------------------------------------------

    @RequestMapping ( value = "/{uid}/reviews", method = RequestMethod.GET )
    public void listReviews(  @PathVariable( "uid" ) String appUid,
                              HttpServletResponse response, HttpServletRequest request )
            throws IOException
    {
        App app = appStoreService.getApp( appUid );

        if ( app == null )
        {
            renderService.renderNotFound( response, request, NOT_FOUND + appUid );
        }

        Set<Review> reviews = app.getReviews();

        renderService.toJson( response.getOutputStream(), reviews );
    }

    // -------------------------------------------------------------------------
    // POST
    // -------------------------------------------------------------------------

    @RequestMapping ( value = "/{uid}/reviews", method = RequestMethod.POST )
    public void addReview( @PathVariable( "uid" ) String appUid,
                          HttpServletResponse response, HttpServletRequest request )
            throws IOException
    {
        Review review = renderService.fromJson( request.getInputStream(), Review.class );

        App app = appStoreService.getApp( appUid );

        if ( app == null )
        {
            renderService.renderNotFound( response, request, NOT_FOUND + appUid );
        }

        appStoreService.addReviewToApp( app, review );

        renderService.renderCreated( response, request, "App review added" );
    }

    @RequestMapping ( value = "/{uid}/approval", method = RequestMethod.POST )
    public void approveApp( @PathVariable( "uid" ) String appUid,
                            @RequestParam( name = "status", required = true ) AppStatus status,
                            HttpServletResponse response, HttpServletRequest request )
            throws IOException
    {
        App app = appStoreService.getApp( appUid );

        if ( app == null )
        {
            renderService.renderNotFound( response, request, NOT_FOUND + appUid );
        }

        appStoreService.setAppApproval( app, status );

        renderService.renderOk( response, request, "Status changed for app: " + app.getAppName() );
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    @RequestMapping ( value = "/{uid}/reviews/{ruid}", method = RequestMethod.DELETE )
    public void deleteReview( @PathVariable( "uid" ) String appUid,
                              @PathVariable( "ruid" ) String reviewuid,
                              HttpServletResponse response, HttpServletRequest request )
            throws IOException
    {
        App app = appStoreService.getApp( appUid );

        Review review = reviewService.getReview( reviewuid );

        if ( app == null || review == null )
        {
            renderService.renderNotFound( response, request, "No entity found for given ids" );
        }

        appStoreService.removeReviewFromApp( app, review );

        renderService.renderOk( response, request, "Review Removed");
    }
}
